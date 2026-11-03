const express = require('express');
const controller = require('../controllers/projectController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../middleware/validateObjectId');
const { writeLimiter } = require('../middleware/rateLimit');
const { projectCreateSchema, projectUpdateSchema } = require('../validators/schemas');

const router = express.Router();
router.param('id', objectIdParam('id', 'project ID'));

router
  .route('/')
  .get(controller.list)
  .post(protect, adminOnly, writeLimiter, validate(projectCreateSchema), controller.create);

router
  .route('/:id')
  .get(controller.detail)
  .put(protect, adminOnly, writeLimiter, validate(projectUpdateSchema), controller.update)
  .patch(protect, adminOnly, writeLimiter, validate(projectUpdateSchema), controller.update)
  .delete(protect, adminOnly, writeLimiter, controller.remove);

module.exports = router;
