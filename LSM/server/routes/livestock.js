const express = require('express');
const Livestock = require('../models/Livestock');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all livestock for a user
router.get('/', auth, async (req, res) => {
  try {
    const livestock = await Livestock.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(livestock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single livestock
router.get('/:id', auth, async (req, res) => {
  try {
    const livestock = await Livestock.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    res.json(livestock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new livestock
router.post('/', auth, async (req, res) => {
  try {
    const livestock = new Livestock({
      ...req.body,
      userId: req.user.userId
    });
    
    await livestock.save();
    res.status(201).json(livestock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update livestock
router.put('/:id', auth, async (req, res) => {
  try {
    const livestock = await Livestock.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    res.json(livestock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete livestock
router.delete('/:id', auth, async (req, res) => {
  try {
    const livestock = await Livestock.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    res.json({ message: 'Livestock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
