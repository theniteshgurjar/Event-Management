const express = require('express');
const { getNotifications } = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getNotifications);

module.exports = router;
