const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all health records for a user
router.get('/', auth, async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(healthRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single health record
router.get('/:id', auth, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed');
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.json(healthRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new health record
router.post('/', auth, async (req, res) => {
  try {
    const healthRecord = new HealthRecord({
      ...req.body,
      userId: req.user.userId
    });
    
    await healthRecord.save();
    await healthRecord.populate('animalId', 'name species breed');
    
    res.status(201).json(healthRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update health record
router.put('/:id', auth, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.json(healthRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete health record
router.delete('/:id', auth, async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
