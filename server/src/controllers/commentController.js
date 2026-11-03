const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

async function findVisiblePost(postId) {
  const post = await Post.findOne({ _id: postId, published: true }).select('_id author');
  if (!post) throw new ApiError(404, 'Post not found.');
  return post;
}

exports.list = asyncHandler(async (req, res) => {
  await findVisiblePost(req.params.postId);
  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: 1 })
    .populate('author', 'username')
    .lean();
  res.json({ success: true, count: comments.length, data: comments });
});

exports.create = asyncHandler(async (req, res) => {
  await findVisiblePost(req.params.postId);
  const comment = await Comment.create({
    body: req.body.body,
    post: req.params.postId,
    author: req.user._id
  });
  await comment.populate('author', 'username');
  res.status(201).json({ success: true, message: 'Comment posted.', data: comment });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).select('_id author');
  if (!post) throw new ApiError(404, 'Post not found.');

  const comment = await Comment.findOne({ _id: req.params.commentId, post: post._id });
  if (!comment) throw new ApiError(404, 'Comment not found on this post.');

  const wroteComment = String(comment.author) === String(req.user._id);
  const ownsPost = String(post.author) === String(req.user._id);
  if (!wroteComment && !ownsPost && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the comment author or the post author can delete this comment.');
  }

  await comment.deleteOne();
  res.status(204).end();
});
