const Booking = require('../models/Booking');
const Classroom = require('../models/Classroom');
const Playground = require('../models/Playground');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      bookingType,
      resourceId,
      date,
      startTime,
      endTime,
      duration,
      purpose,
      professor,
      subject,
      studentYear,
      expectedStudents,
      teamDetails
    } = req.body;

    // Validate duration (max 2 hours)
    if (duration > 2) {
      return res.status(400).json({ message: 'Maximum booking duration is 2 hours' });
    }

    // Check if resource exists
    const ResourceModel = bookingType === 'classroom' ? Classroom : Playground;
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      resourceId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      bookingType,
      resourceId,
      resourceModel: bookingType === 'classroom' ? 'Classroom' : 'Playground',
      date,
      startTime,
      endTime,
      duration,
      purpose,
      professor,
      subject,
      studentYear,
      expectedStudents,
      teamDetails
    });

    await booking.populate('user', 'name rollNumber');
    await booking.populate('resourceId');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings for a user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('resourceId')
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bookings for a specific resource and date
const getResourceBookings = async (req, res) => {
  try {
    const { resourceId, date } = req.query;

    const bookings = await Booking.find({
      resourceId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).populate('user', 'name rollNumber');

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getResourceBookings,
  cancelBooking
};