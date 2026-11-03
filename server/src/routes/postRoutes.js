const express = require('express');
const controller = require('../controllers/postController');
const protect = require('../middleware/protect');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimit');
const { postCreateSchema, postUpdateSchema } = require('../validators/schemas');

const router = express.Router();

// Nested comments belong to the post in the URL. Mount them before the
// ordinary /:id route so the prefix is never mistaken for a post ID.
router.use('/:postId/comments', require('./commentRoutes'));

// Dashboard listing: admins see every post, authors see their own drafts.
router.get('/manage', protect, controller.manage);

router.param('id', objectIdParam('id', 'post ID'));
router.route('/').get(controller.list).post(protect, writeLimiter, validate(postCreateSchema), controller.create);
router
  .route('/:id')
  .get(controller.detail)
  .put(protect, writeLimiter, validate(postUpdateSchema), controller.update)
  .patch(protect, writeLimiter, validate(postUpdateSchema), controller.update)
  .delete(protect, writeLimiter, controller.remove);

module.exports = router;
