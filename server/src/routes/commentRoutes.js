const express = require('express');
const controller = require('../controllers/commentController');
const protect = require('../middleware/protect');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimit');
const { commentSchema } = require('../validators/schemas');

// mergeParams keeps :postId from the parent blog route.
const router = express.Router({ mergeParams: true });
router.param('postId', objectIdParam('postId', 'post ID'));
router.param('commentId', objectIdParam('commentId', 'comment ID'));

router.get('/', controller.list);
router.post('/', protect, writeLimiter, validate(commentSchema), controller.create);
router.delete('/:commentId', protect, writeLimiter, controller.remove);

module.exports = router;
