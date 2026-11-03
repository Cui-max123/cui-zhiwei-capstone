const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.minLevel) {
    const minLevel = Number(req.query.minLevel);
    if (Number.isInteger(minLevel)) filter.level = { $gte: Math.min(5, Math.max(1, minLevel)) };
  }
  const skills = await Skill.find(filter).sort({ category: 1, order: 1, name: 1 }).lean();
  res.json({ success: true, count: skills.length, data: skills });
});

exports.detail = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).lean();
  if (!skill) throw new ApiError(404, 'Skill not found.');
  res.json({ success: true, data: skill });
});

exports.create = asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json({ success: true, message: 'Skill added.', data: skill });
});

exports.update = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) throw new ApiError(404, 'Skill not found.');
  Object.assign(skill, req.body);
  await skill.save();
  res.json({ success: true, message: 'Skill updated.', data: skill });
});

exports.remove = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) throw new ApiError(404, 'Skill not found.');
  res.status(204).end();
});
