const express = require('express');
const controller = require('../controllers/contactController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../middleware/validateObjectId');
const { contactLimiter, writeLimiter } = require('../middleware/rateLimit');
const { contactSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/', contactLimiter, validate(contactSchema), controller.create);
router.get('/', protect, adminOnly, controller.list);
router.param('id', objectIdParam('id', 'message ID'));
router
  .route('/:id/read')
  .patch(protect, adminOnly, writeLimiter, controller.markRead)
  .put(protect, adminOnly, writeLimiter, controller.markRead);
router.delete('/:id', protect, adminOnly, writeLimiter, controller.remove);

module.exports = router;
