const express = require('express');
const { getAllVenues, createVenue, updateVenue, deleteVenue, getVenueBookings } = require('../controllers/venueController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllVenues);
router.get('/bookings', getVenueBookings);
router.post('/', authenticateToken, authorizeRole(['ADMIN', 'DSW']), createVenue);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW']), updateVenue);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN', 'DSW']), deleteVenue);

module.exports = router;
