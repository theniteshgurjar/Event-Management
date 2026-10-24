const express = require('express');
const { createEvent, getEvents, getEventById, updateEventStatus, deleteEvent } = require('../controllers/eventController');
const { authenticateToken, authorizeRole, optionalAuthenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: View all events (Students can see upcoming events)
router.get('/', optionalAuthenticateToken, getEvents);
router.get('/:id', optionalAuthenticateToken, getEventById);

// Protected: Create Event (Club Coordinator, Admin, Faculty, HOD)
router.post('/',
    authenticateToken,
    authorizeRole(['CLUB_COORDINATOR', 'ADMIN', 'FACULTY', 'HOD']),
    createEvent
);

// Protected: Update Status (Admin, DSW)
router.put('/:id/status', authenticateToken, authorizeRole(['ADMIN', 'DSW', 'HOD']), updateEventStatus);

// Protected: Delete Event (Club Coordinator, Admin, DSW, Faculty) - Validation Logic in Controller
router.delete('/:id', authenticateToken, authorizeRole(['CLUB_COORDINATOR', 'ADMIN', 'DSW', 'FACULTY', 'HOD']), deleteEvent);

module.exports = router;
