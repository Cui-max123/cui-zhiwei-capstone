const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slug');
const { escapeRegex, readingTime, makeExcerpt } = require('../utils/text');
const { parsePagination, pageMeta } = require('../utils/pagination');

function canManage(post, user) {
  return user.role === 'admin' || String(post.author?._id || post.author) === String(user._id);
}

async function commentCountMap(postIds) {
  if (!postIds.length) return new Map();
  const rows = await Comment.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: '$post', count: { $sum: 1 } } }
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

async function decorate(posts) {
  const counts = await commentCountMap(posts.map((post) => post._id));
  return posts.map((post) => ({
    ...post,
    commentCount: counts.get(String(post._id)) || 0,
    readTime: readingTime(post.content)
  }));
}

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 9);
  const filter = { published: true };
  if (req.query.tag && String(req.query.tag).trim()) {
    filter.tags = String(req.query.tag).trim().toLowerCase();
  }
  if (req.query.q && String(req.query.q).trim()) {
    const pattern = new RegExp(escapeRegex(String(req.query.q).trim()), 'i');
    filter.$or = [{ title: pattern }, { excerpt: pattern }, { content: pattern }, { tags: pattern }];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .lean(),
    Post.countDocuments(filter)
  ]);

  const data = await decorate(posts);
  res.json({ success: true, count: data.length, data, meta: pageMeta({ page, limit, total }) });
});

exports.manage = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { author: req.user._id };
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(150)
    .populate('author', 'username')
    .lean();
  res.set('Cache-Control', 'no-store').json({ success: true, count: posts.length, data: await decorate(posts) });
});

exports.detail = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, published: true }).populate('author', 'username').lean();
  if (!post) throw new ApiError(404, 'Post not found.');

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: 1 })
    .populate('author', 'username')
    .lean();

  res.json({
    success: true,
    data: {
      ...post,
      readTime: readingTime(post.content),
      commentCount: comments.length,
      comments
    }
  });
});

exports.create = asyncHandler(async (req, res) => {
  const input = req.body;
  const post = await Post.create({
    ...input,
    excerpt: input.excerpt || makeExcerpt(input.content, 200),
    slug: await uniqueSlug(Post, input.title),
    author: req.user._id
  });
  await post.populate('author', 'username');
  const data = { ...post.toObject(), readTime: readingTime(post.content), commentCount: 0 };
  res.status(201).json({ success: true, message: input.published === false ? 'Draft saved.' : 'Post published.', data });
});

exports.update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (!canManage(post, req.user)) {
    throw new ApiError(403, 'Only the author of this post can edit it.');
  }

  Object.assign(post, req.body);
  if (!post.excerpt && post.content) post.excerpt = makeExcerpt(post.content, 200);
  await post.save();
  await post.populate('author', 'username');
  res.json({
    success: true,
    message: 'Post updated.',
    data: { ...post.toObject(), readTime: readingTime(post.content) }
  });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Post not found.');
  if (!canManage(post, req.user)) {
    throw new ApiError(403, 'Only the author of this post can delete it.');
  }

  // Cascade keeps the database free of comments pointing at a missing post.
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.status(204).end();
});
