const express = require('express');
const { createReport, getReports, getReportById } = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Coordinators and Faculty submit reports
router.post('/', authenticateToken, authorizeRole(['CLUB_COORDINATOR', 'ADMIN', 'FACULTY']), createReport);

// View reports (Filtered by role in controller)
router.get('/', authenticateToken, authorizeRole(['ADMIN', 'DSW', 'FACULTY', 'CLUB_COORDINATOR', 'HOD']), getReports);

// View single report details
router.get('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW', 'FACULTY', 'CLUB_COORDINATOR', 'HOD']), getReportById);

module.exports = router;
