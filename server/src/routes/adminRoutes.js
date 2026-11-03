const express = require('express');
const controller = require('../controllers/adminController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/stats', protect, controller.stats);
router.get('/activity', protect, adminOnly, controller.activity);

module.exports = router;
