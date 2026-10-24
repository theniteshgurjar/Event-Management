const express = require('express');
const { createClub, getAllClubs, getClubById, updateClub, deleteClub, getMyClub } = require('../controllers/clubController');
const { authenticateToken, authorizeRole, optionalAuthenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes (or valid for all authenticated users)
router.get('/', getAllClubs);
router.get('/my-club', authenticateToken, getMyClub);
router.get('/:id', optionalAuthenticateToken, getClubById);

// Protected Routes (Admin / DSW)
// Only ADMIN can create clubs
router.post('/', authenticateToken, authorizeRole(['ADMIN', 'DSW']), createClub);

// Admin, DSW, Faculty, and Club Coordinators can update (Refine logic later for specific coordinators)
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW', 'CLUB_COORDINATOR', 'FACULTY', 'HOD']), updateClub);

// Only Admin and DSW can delete clubs
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW']), deleteClub);

module.exports = router;


