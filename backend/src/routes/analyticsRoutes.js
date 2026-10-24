const express = require('express');
const {
    getOverallStats,
    getClubStats,
    getTrendStats,
    getVenueStats,
    getCategoryStats
} = require('../controllers/analyticsController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();


const allowedRoles = ['ADMIN', 'DSW', 'CLUB_COORDINATOR', 'FACULTY', 'HOD'];

router.get('/overall', authenticateToken, authorizeRole(allowedRoles), getOverallStats);
router.get('/clubs', authenticateToken, authorizeRole(allowedRoles), getClubStats);
// router.get('/clubs', getClubStats);
router.get('/trends', authenticateToken, authorizeRole(allowedRoles), getTrendStats);
router.get('/venues', authenticateToken, authorizeRole(allowedRoles), getVenueStats);
router.get('/categories', authenticateToken, authorizeRole(allowedRoles), getCategoryStats);

module.exports = router;
