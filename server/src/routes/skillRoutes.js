const express = require('express');
const controller = require('../controllers/skillController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimit');
const { skillCreateSchema, skillUpdateSchema } = require('../validators/schemas');

const router = express.Router();
router.param('id', objectIdParam('id', 'skill ID'));

router
  .route('/')
  .get(controller.list)
  .post(protect, adminOnly, writeLimiter, validate(skillCreateSchema), controller.create);

router
  .route('/:id')
  .get(controller.detail)
  .put(protect, adminOnly, writeLimiter, validate(skillUpdateSchema), controller.update)
  .patch(protect, adminOnly, writeLimiter, validate(skillUpdateSchema), controller.update)
  .delete(protect, adminOnly, writeLimiter, controller.remove);

module.exports = router;
