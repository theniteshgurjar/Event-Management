const express = require('express');
const { createUser, getAllUsers, updateUserRole, deleteUser, assignClubToUser } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Only ADMIN can create users and view list
router.post('/', authenticateToken, authorizeRole(['ADMIN']), createUser);
router.get('/', authenticateToken, authorizeRole(['ADMIN', 'DSW']), getAllUsers);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW']), updateUserRole);
router.put('/:id/role', authenticateToken, authorizeRole(['ADMIN', 'DSW']), updateUserRole);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW']), deleteUser);
router.post('/:id/assign-club', authenticateToken, authorizeRole(['ADMIN', 'DSW']), assignClubToUser);

module.exports = router;
