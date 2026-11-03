const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, pageMeta } = require('../utils/pagination');

exports.create = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  const saved = await Message.create({ name, email, message });
  res.status(201).json({
    success: true,
    message: 'Message received. Thank you — I usually reply within two days.',
    data: { _id: saved._id }
  });
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20);
  const [messages, total] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Message.countDocuments()
  ]);
  res.set('Cache-Control', 'no-store').json({
    success: true,
    count: messages.length,
    data: messages,
    meta: pageMeta({ page, limit, total })
  });
});

exports.markRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found.');
  message.read = req.body.read !== false;
  message.readAt = message.read ? new Date() : null;
  await message.save();
  res.json({ success: true, message: 'Message updated.', data: message });
});

exports.remove = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found.');
  res.status(204).end();
});
