const mongoose = require('mongoose');

const httpsUrl = {
  validator(value) {
    if (!value) return true;
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  },
  message: 'Use a full https:// URL'
};

const imageRef = {
  validator(value) {
    if (!value) return true;
    return value.startsWith('/') || /^https:\/\//i.test(value);
  },
  message: 'Image must be an https:// URL or a path beginning with /'
};

const highlightSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 40 },
    value: { type: String, trim: true, maxlength: 80 }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 120 },
    summary: { type: String, trim: true, maxlength: 260, default: '' },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: 10, maxlength: 4000 },
    problem: { type: String, trim: true, maxlength: 4000, default: '' },
    solution: { type: String, trim: true, maxlength: 4000, default: '' },
    outcome: { type: String, trim: true, maxlength: 4000, default: '' },
    category: {
      type: String,
      enum: ['Full-stack', 'Frontend', 'Backend', 'Data', 'Tooling', 'Design'],
      default: 'Full-stack'
    },
    status: {
      type: String,
      enum: ['shipped', 'in-progress', 'concept'],
      default: 'shipped'
    },
    year: { type: String, trim: true, maxlength: 4, default: () => String(new Date().getFullYear()) },
    role: { type: String, trim: true, maxlength: 100, default: 'Design & development' },
    timeline: { type: String, trim: true, maxlength: 80, default: '' },
    techStack: [{ type: String, trim: true, maxlength: 30 }],
    highlights: { type: [highlightSchema], default: [] },
    imageUrl: { type: String, trim: true, maxlength: 500, default: '', validate: imageRef },
    repoUrl: { type: String, trim: true, maxlength: 500, default: '', validate: httpsUrl },
    liveUrl: { type: String, trim: true, maxlength: 500, default: '', validate: httpsUrl },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0, max: 999 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    collection: 'projects',
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

projectSchema.index({ featured: -1, order: 1, createdAt: -1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);
