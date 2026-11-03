const { z } = require('zod');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers and underscores only')
  .transform((value) => value.toLowerCase());

const email = z
  .string()
  .trim()
  .max(254)
  .regex(emailPattern, 'Enter a valid email address')
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password must be 72 characters or fewer');

const stringList = (maxItems = 12, maxLength = 30) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
      return value;
    },
    z.array(z.string().trim().min(1).max(maxLength)).max(maxItems)
  );

const imageRef = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || value.startsWith('/') || /^https:\/\//i.test(value), {
    message: 'Use an https:// URL or a path beginning with /'
  });

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || /^https:\/\/[^\s]+$/i.test(value), {
    message: 'Use a full https:// URL'
  });

const registerSchema = z.object({
  username,
  email,
  password
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(72)
});

const projectBase = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  summary: z.string().trim().max(260).optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(4000),
  problem: z.string().trim().max(4000).optional(),
  solution: z.string().trim().max(4000).optional(),
  outcome: z.string().trim().max(4000).optional(),
  category: z.enum(['Full-stack', 'Frontend', 'Backend', 'Data', 'Tooling', 'Design']).optional(),
  status: z.enum(['shipped', 'in-progress', 'concept']).optional(),
  year: z.string().trim().regex(/^\d{4}$/, 'Use a four-digit year').optional(),
  role: z.string().trim().max(100).optional(),
  timeline: z.string().trim().max(80).optional(),
  techStack: stringList(12, 30).optional(),
  highlights: z
    .array(
      z.object({
        label: z.string().trim().max(40),
        value: z.string().trim().max(80)
      })
    )
    .max(3)
    .optional(),
  imageUrl: imageRef.optional(),
  repoUrl: httpsUrl.optional(),
  liveUrl: httpsUrl.optional(),
  featured: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional()
});

const projectCreateSchema = projectBase.extend({
  category: projectBase.shape.category.default('Full-stack'),
  status: projectBase.shape.status.default('shipped'),
  techStack: stringList(12, 30).default([]),
  highlights: projectBase.shape.highlights.default([]),
  imageUrl: imageRef.default(''),
  repoUrl: httpsUrl.default(''),
  liveUrl: httpsUrl.default(''),
  featured: z.boolean().default(false),
  order: z.coerce.number().int().min(0).max(999).default(0)
});

const projectUpdateSchema = projectBase
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'Send at least one field to update' });

const postBase = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  content: z.string().trim().min(20, 'Content must be at least 20 characters').max(30000),
  excerpt: z.string().trim().max(320).optional(),
  tags: stringList(8, 24).optional(),
  coverImage: imageRef.optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional()
});

const postCreateSchema = postBase.extend({
  tags: stringList(8, 24).default([]),
  coverImage: imageRef.default(''),
  published: z.boolean().default(true),
  featured: z.boolean().default(false)
});

const postUpdateSchema = postBase
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'Send at least one field to update' });

const commentSchema = z.object({
  body: z.string().trim().min(1, 'Write a comment first').max(1000, 'Keep comments under 1000 characters')
});

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000)
});

const skillBase = z.object({
  name: z.string().trim().min(1).max(40),
  category: z.enum(['Frontend', 'Backend', 'Database', 'Tooling', 'Design', 'Data']),
  level: z.coerce.number().int().min(1).max(5),
  order: z.coerce.number().int().min(0).max(999).optional()
});

const skillCreateSchema = skillBase.extend({
  order: z.coerce.number().int().min(0).max(999).default(0)
});

const skillUpdateSchema = skillBase
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'Send at least one field to update' });

module.exports = {
  registerSchema,
  loginSchema,
  projectCreateSchema,
  projectUpdateSchema,
  postCreateSchema,
  postUpdateSchema,
  commentSchema,
  contactSchema,
  skillCreateSchema,
  skillUpdateSchema
};
