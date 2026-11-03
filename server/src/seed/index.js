const User = require('../models/User');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Skill = require('../models/Skill');
const env = require('../config/env');
const { accounts, projects, skills, posts, comments, messages } = require('./data');

async function upsertAccount(key, data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    if (key === 'admin' || env.adminEmails.includes(data.email)) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
      }
    }
    return existing;
  }
  return User.create(data);
}

async function seedDatabase({ reset = false, quiet = false } = {}) {
  if (reset) {
    await Promise.all([
      Project.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Message.deleteMany({}),
      Skill.deleteMany({}),
      User.deleteMany({})
    ]);
  }

  const admin = await upsertAccount('admin', accounts.admin);
  const linwei = await upsertAccount('linwei', accounts.linwei);
  const maya = await upsertAccount('maya', accounts.maya);
  const authors = { linwei, maya };

  for (const project of projects) {
    await Project.findOneAndUpdate(
      { slug: project.slug },
      { $set: { ...project, user: admin._id } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  for (const post of posts) {
    await Post.findOneAndUpdate(
      { slug: post.slug },
      { $set: { ...post, author: admin._id } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  for (const skill of skills) {
    await Skill.findOneAndUpdate(
      { name: skill.name, category: skill.category },
      { $set: skill },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  const commentCount = await Comment.countDocuments();
  if (commentCount === 0 || reset) {
    for (const comment of comments) {
      const post = await Post.findOne({ slug: comment.postSlug }).select('_id');
      const author = authors[comment.authorKey];
      if (!post || !author) continue;
      await Comment.findOneAndUpdate(
        { post: post._id, body: comment.body },
        { $setOnInsert: { post: post._id, author: author._id, body: comment.body } },
        { upsert: true }
      );
    }
  }

  if (reset || (await Message.countDocuments()) === 0) {
    for (const message of messages) {
      await Message.findOneAndUpdate(
        { email: message.email, message: message.message },
        { $setOnInsert: message },
        { upsert: true }
      );
    }
  }

  const [projectTotal, postTotal, skillTotal, commentTotal, messageTotal] = await Promise.all([
    Project.countDocuments(),
    Post.countDocuments(),
    Skill.countDocuments(),
    Comment.countDocuments(),
    Message.countDocuments()
  ]);

  if (!quiet) {
    console.log('Seed complete.');
    console.log(`  projects: ${projectTotal}`);
    console.log(`  posts:    ${postTotal}`);
    console.log(`  skills:   ${skillTotal}`);
    console.log(`  comments: ${commentTotal}`);
    console.log(`  messages: ${messageTotal}`);
    console.log('  admin:    cui@cuizhiwei.dev / CuiZhiwei2026!');
  }

  return { projectTotal, postTotal, skillTotal, commentTotal, messageTotal };
}

module.exports = { seedDatabase };
