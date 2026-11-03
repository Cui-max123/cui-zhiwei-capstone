const Project = require('../models/Project');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const Skill = require('../models/Skill');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.stats = asyncHandler(async (req, res) => {
  const admin = req.user.role === 'admin';
  const postFilter = admin ? {} : { author: req.user._id };

  const [projects, posts, comments, skills, messages, unreadMessages, authors] = await Promise.all([
    Project.countDocuments(),
    Post.countDocuments(postFilter),
    Comment.countDocuments(admin ? {} : { author: req.user._id }),
    Skill.countDocuments(),
    admin ? Message.countDocuments() : Promise.resolve(0),
    admin ? Message.countDocuments({ read: false }) : Promise.resolve(0),
    admin ? User.countDocuments() : Promise.resolve(1)
  ]);

  res.set('Cache-Control', 'no-store').json({
    success: true,
    data: { projects, posts, comments, skills, messages, unreadMessages, authors }
  });
});

exports.activity = asyncHandler(async (_req, res) => {
  const [posts, comments, messages] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).limit(5).select('title createdAt published').lean(),
    Comment.find().sort({ createdAt: -1 }).limit(5).populate('author', 'username').select('body createdAt').lean(),
    Message.find().sort({ createdAt: -1 }).limit(5).select('name createdAt read').lean()
  ]);

  const feed = [
    ...posts.map((item) => ({
      type: 'post',
      label: item.published ? 'Post published' : 'Draft saved',
      text: item.title,
      at: item.createdAt
    })),
    ...comments.map((item) => ({
      type: 'comment',
      label: 'New comment',
      text: `${item.author?.username || 'Someone'}: ${item.body.slice(0, 70)}`,
      at: item.createdAt
    })),
    ...messages.map((item) => ({
      type: 'message',
      label: item.read ? 'Message read' : 'New message',
      text: item.name,
      at: item.createdAt
    }))
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);

  res.set('Cache-Control', 'no-store').json({ success: true, data: feed });
});
