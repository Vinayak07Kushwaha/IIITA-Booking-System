const express = require('express');
const Classroom = require('../models/Classroom');
const Playground = require('../models/Playground');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all classrooms
router.get('/classrooms', protect, async (req, res) => {
  try {
    const classrooms = await Classroom.find({ isActive: true }).sort({ building: 1, roomNumber: 1 });
    res.json({ success: true, classrooms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all playgrounds
router.get('/playgrounds', protect, async (req, res) => {
  try {
    const playgrounds = await Playground.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, playgrounds });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize classrooms and playgrounds (run once)
router.post('/initialize', async (req, res) => {
  try {
    // Clear existing data
    await Classroom.deleteMany({});
    await Playground.deleteMany({});

    // Create classrooms
    const classrooms = [];
    const buildings = ['CC1', 'CC2', 'CC3'];
    
    for (const building of buildings) {
      for (let i = 1; i <= 20; i++) {
        const roomNumber = `${building}-${i.toString().padStart(3, '0')}`;
        classrooms.push({
          roomNumber,
          building,
          capacity: 60,
          facilities: ['Projector', 'Whiteboard', 'AC']
        });
      }
    }

    await Classroom.insertMany(classrooms);

    // Create playgrounds
    const playgrounds = [
      {
        name: 'Cricket Ground',
        type: 'outdoor',
        maxPlayers: 22,
        equipment: ['Cricket Bats', 'Balls', 'Stumps', 'Pads']
      },
      {
        name: 'Football Ground',
        type: 'outdoor',
        maxPlayers: 22,
        equipment: ['Football', 'Goal Posts', 'Corner Flags']
      },
      {
        name: 'Basketball Court',
        type: 'outdoor',
        maxPlayers: 10,
        equipment: ['Basketball', 'Hoops']
      },
      {
        name: 'Volleyball Court',
        type: 'outdoor',
        maxPlayers: 12,
        equipment: ['Volleyball', 'Net']
      },
      {
        name: 'Swimming Pool',
        type: 'aquatic',
        maxPlayers: 20,
        equipment: ['Lane Ropes', 'Starting Blocks']
      }
    ];

    await Playground.insertMany(playgrounds);

    res.json({ success: true, message: 'Resources initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;