const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Skill name is required'], trim: true, maxlength: 40 },
    category: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Database', 'Tooling', 'Design', 'Data']
    },
    level: { type: Number, required: true, min: 1, max: 5, default: 3 },
    order: { type: Number, default: 0, min: 0, max: 999 }
  },
  {
    timestamps: true,
    collection: 'skills',
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

skillSchema.index({ name: 1, category: 1 }, { unique: true });
skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Skill', skillSchema);
