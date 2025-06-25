const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['classroom', 'playground']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceModel'
  },
  resourceModel: {
    type: String,
    required: true,
    enum: ['Classroom', 'Playground']
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    max: 2
  },
  purpose: {
    type: String,
    required: true
  },
  // Classroom specific fields
  professor: {
    type: String,
    required: function() { return this.bookingType === 'classroom'; }
  },
  subject: {
    type: String,
    required: function() { return this.bookingType === 'classroom'; }
  },
  studentYear: {
    type: String,
    required: function() { return this.bookingType === 'classroom'; }
  },
  expectedStudents: {
    type: Number,
    required: function() { return this.bookingType === 'classroom'; }
  },
  // Playground specific fields
  teamDetails: {
    teamName: String,
    teamMembers: [{
      name: String,
      rollNumber: String
    }],
    captainContact: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'approved'
  },
  notes: String
}, {
  timestamps: true
});

// Prevent overlapping bookings
bookingSchema.index({ 
  resourceId: 1, 
  date: 1, 
  startTime: 1, 
  endTime: 1 
}, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);