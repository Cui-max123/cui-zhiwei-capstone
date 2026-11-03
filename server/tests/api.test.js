process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_DISABLED = 'true';
process.env.BCRYPT_ROUNDS = '4';
process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.MONGO_URI = 'mongodb://localhost:27017/placeholder';
process.env.CLIENT_ORIGINS = 'http://localhost:5173';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { seedDatabase } = require('../src/seed');

let mongod;

async function login(email, password) {
  const res = await request(app).post('/api/users/login').send({ email, password });
  assert.equal(res.status, 200);
  return res.body.data.token;
}

async function register(username, email, password = 'CoursePass123!') {
  const res = await request(app).post('/api/users/register').send({ username, email, password });
  assert.equal(res.status, 201);
  return res.body.data.token;
}

before(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri('cui_portfolio'));
  await seedDatabase({ reset: true, quiet: true });
});

after(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

test('health endpoint reports ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, 'ok');
});

test('API root lists routes', async () => {
  const res = await request(app).get('/api');
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'Cui Zhiwei Portfolio & Blog API');
});

test('public projects list returns seeded data', async () => {
  const res = await request(app).get('/api/projects');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.count >= 6);
  assert.ok(res.body.data[0].title);
});

test('project detail returns one project', async () => {
  const list = await request(app).get('/api/projects');
  const id = list.body.data[0]._id;
  const res = await request(app).get(`/api/projects/${id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data._id, id);
});

test('malformed project id is rejected with 400', async () => {
  const res = await request(app).get('/api/projects/not-an-id');
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('register returns a JWT and a user', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({ username: 'newcomer', email: 'newcomer@example.com', password: 'CoursePass123!' });
  assert.equal(res.status, 201);
  assert.ok(res.body.data.token);
  assert.equal(res.body.data.user.username, 'newcomer');
  assert.equal(res.body.data.user.role, 'author');
});

test('duplicate registration returns 409', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({ username: 'newcomer2', email: 'newcomer@example.com', password: 'CoursePass123!' });
  assert.equal(res.status, 409);
});

test('login with wrong password returns 401', async () => {
  const res = await request(app)
    .post('/api/users/login')
    .send({ email: 'cui@cuizhiwei.dev', password: 'wrong-password' });
  assert.equal(res.status, 401);
});

test('admin token can read /users/me', async () => {
  const token = await login('cui@cuizhiwei.dev', 'CuiZhiwei2026!');
  const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.role, 'admin');
});

test('author cannot create a project (admin-only)', async () => {
  const token = await register('plainauthor', 'plainauthor@example.com');
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Forbidden project', description: 'This should not be created by an author.' });
  assert.equal(res.status, 403);
});

test('admin can create, update and delete a project', async () => {
  const token = await login('cui@cuizhiwei.dev', 'CuiZhiwei2026!');
  const create = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Project', description: 'A project created by the API test suite.', category: 'Tooling' });
  assert.equal(create.status, 201);
  const id = create.body.data._id;

  const update = await request(app)
    .patch(`/api/projects/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ featured: true });
  assert.equal(update.status, 200);
  assert.equal(update.body.data.featured, true);

  const del = await request(app).delete(`/api/projects/${id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(del.status, 204);
});

test('public blog list returns published posts with commentCount and readTime', async () => {
  const res = await request(app).get('/api/blog');
  assert.equal(res.status, 200);
  assert.ok(res.body.count >= 4);
  assert.equal(typeof res.body.data[0].commentCount, 'number');
  assert.equal(typeof res.body.data[0].readTime, 'number');
  assert.ok(res.body.meta.total >= 4);
});

test('blog detail includes comments', async () => {
  const list = await request(app).get('/api/blog');
  const first = list.body.data[0];
  const res = await request(app).get(`/api/blog/${first._id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data._id, first._id);
  assert.ok(Array.isArray(res.body.data.comments));
});

test('author can create a post and it appears in their manage list', async () => {
  const token = await register('writer', 'writer@example.com');
  const create = await request(app)
    .post('/api/blog')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'My first post', content: 'This is a body long enough to pass the twenty character minimum check.' });
  assert.equal(create.status, 201);
  assert.equal(create.body.data.author.username, 'writer');

  const manage = await request(app).get('/api/blog/manage').set('Authorization', `Bearer ${token}`);
  assert.equal(manage.status, 200);
  assert.ok(manage.body.data.some((post) => post.title === 'My first post'));
});

test('author cannot edit another author post', async () => {
  const adminToken = await login('cui@cuizhiwei.dev', 'CuiZhiwei2026!');
  const authorToken = await register('meddler', 'meddler@example.com');
  const posts = await request(app).get('/api/blog/manage').set('Authorization', `Bearer ${adminToken}`);
  const target = posts.body.data.find((post) => post.title !== 'My first post');
  const res = await request(app)
    .patch(`/api/blog/${target._id}`)
    .set('Authorization', `Bearer ${authorToken}`)
    .send({ title: 'Hijacked' });
  assert.equal(res.status, 403);
});

test('authenticated user can comment and delete their own comment', async () => {
  const token = await register('commenter', 'commenter@example.com');
  const posts = await request(app).get('/api/blog');
  const postId = posts.body.data[0]._id;

  const create = await request(app)
    .post(`/api/blog/${postId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ body: 'A thoughtful comment for the test.' });
  assert.equal(create.status, 201);
  const commentId = create.body.data._id;

  const del = await request(app)
    .delete(`/api/blog/${postId}/comments/${commentId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(del.status, 204);
});

test('unauthenticated comment is rejected', async () => {
  const posts = await request(app).get('/api/blog');
  const postId = posts.body.data[0]._id;
  const res = await request(app).post(`/api/blog/${postId}/comments`).send({ body: 'no token' });
  assert.equal(res.status, 401);
});

test('contact form saves a message and admin can read inbox', async () => {
  const create = await request(app)
    .post('/api/contact')
    .send({ name: 'Test Visitor', email: 'visitor@example.com', message: 'This is a contact message long enough.' });
  assert.equal(create.status, 201);

  const token = await login('cui@cuizhiwei.dev', 'CuiZhiwei2026!');
  const inbox = await request(app).get('/api/contact').set('Authorization', `Bearer ${token}`);
  assert.equal(inbox.status, 200);
  assert.ok(inbox.body.data.some((m) => m.email === 'visitor@example.com'));
});

test('non-admin cannot read the contact inbox', async () => {
  const token = await register('nosy', 'nosy@example.com');
  const res = await request(app).get('/api/contact').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 403);
});

test('skills list returns seeded skills with level filter', async () => {
  const all = await request(app).get('/api/skills');
  assert.equal(all.status, 200);
  assert.ok(all.body.count >= 20);

  const filtered = await request(app).get('/api/skills?minLevel=5');
  assert.ok(filtered.body.data.every((skill) => skill.level >= 5));
});

test('admin stats returns counters', async () => {
  const token = await login('cui@cuizhiwei.dev', 'CuiZhiwei2026!');
  const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.data.projects, 'number');
  assert.equal(typeof res.body.data.posts, 'number');
});

test('unknown route returns consistent 404 envelope', async () => {
  const res = await request(app).get('/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message);
});

test('invalid JSON returns 400', async () => {
  const res = await request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send('{not valid json');
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});
