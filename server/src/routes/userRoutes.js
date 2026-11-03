const express = require('express');
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const protect = require('../middleware/protect');
const { authLimiter } = require('../middleware/rateLimit');
const { registerSchema, loginSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.get('/me', protect, controller.me);

module.exports = router;
