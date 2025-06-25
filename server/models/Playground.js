const mongoose = require('mongoose');

const playgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Cricket Ground', 'Football Ground', 'Basketball Court', 'Volleyball Court', 'Swimming Pool']
  },
  type: {
    type: String,
    required: true,
    enum: ['outdoor', 'indoor', 'aquatic']
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  equipment: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Playground', playgroundSchema);