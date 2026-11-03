const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 160 },
    excerpt: { type: String, trim: true, maxlength: 320, default: '' },
    content: { type: String, required: [true, 'Content is required'], trim: true, minlength: 20, maxlength: 30000 },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 24 }],
    coverImage: { type: String, trim: true, maxlength: 500, default: '' },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    collection: 'posts',
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
