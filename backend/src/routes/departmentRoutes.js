const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Public / Authenticated Read
router.get('/', authenticateToken, departmentController.getAllDepartments);
router.get('/:id', authenticateToken, departmentController.getDepartmentById);

// Admin Only
router.post('/', authenticateToken, authorizeRole(['ADMIN']), departmentController.createDepartment);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), departmentController.updateDepartment);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), departmentController.deleteDepartment);

module.exports = router;
