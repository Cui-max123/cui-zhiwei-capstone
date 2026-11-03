const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slug');
const { escapeRegex, makeExcerpt } = require('../utils/text');

function filterProjects(query) {
  const filter = {};
  if (query.category && query.category !== 'All') filter.category = query.category;
  if (query.featured === 'true') filter.featured = true;
  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.q && String(query.q).trim()) {
    const pattern = new RegExp(escapeRegex(String(query.q).trim()), 'i');
    filter.$or = [{ title: pattern }, { summary: pattern }, { description: pattern }, { techStack: pattern }];
  }
  return filter;
}

exports.list = asyncHandler(async (req, res) => {
  const projects = await Project.find(filterProjects(req.query))
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .populate('user', 'username')
    .lean();
  res.json({ success: true, count: projects.length, data: projects });
});

exports.detail = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('user', 'username').lean();
  if (!project) throw new ApiError(404, 'Project not found.');
  res.json({ success: true, data: project });
});

exports.create = asyncHandler(async (req, res) => {
  const input = req.body;
  const project = await Project.create({
    ...input,
    summary: input.summary || makeExcerpt(input.description, 180),
    slug: await uniqueSlug(Project, input.title),
    user: req.user._id
  });
  await project.populate('user', 'username');
  res.status(201).json({ success: true, message: 'Project created.', data: project });
});

exports.update = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');

  Object.assign(project, req.body);
  if (!project.summary && project.description) project.summary = makeExcerpt(project.description, 180);
  await project.save();
  await project.populate('user', 'username');
  res.json({ success: true, message: 'Project updated.', data: project });
});

exports.remove = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');
  res.status(204).end();
});
