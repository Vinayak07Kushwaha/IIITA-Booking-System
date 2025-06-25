const express = require('express');
const {
  createBooking,
  getUserBookings,
  getResourceBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/user', getUserBookings);
router.get('/resource', getResourceBookings);
router.put('/cancel/:id', cancelBooking);

module.exports = router;