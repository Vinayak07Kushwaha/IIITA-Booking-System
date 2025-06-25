const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  building: {
    type: String,
    required: true,
    enum: ['CC1', 'CC2', 'CC3']
  },
  capacity: {
    type: Number,
    required: true,
    default: 60
  },
  facilities: [{
    type: String,
    enum: ['Projector', 'AC', 'Whiteboard', 'Computer', 'Audio System']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);