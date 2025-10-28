const express = require('express');
const FeedingRecord = require('../models/FeedingRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all feeding records for a user
router.get('/', auth, async (req, res) => {
  try {
    const feedingRecords = await FeedingRecord.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(feedingRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single feeding record
router.get('/:id', auth, async (req, res) => {
  try {
    const feedingRecord = await FeedingRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed');
    
    if (!feedingRecord) {
      return res.status(404).json({ message: 'Feeding record not found' });
    }
    
    res.json(feedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new feeding record
router.post('/', auth, async (req, res) => {
  try {
    const feedingRecord = new FeedingRecord({
      ...req.body,
      userId: req.user.userId
    });
    
    await feedingRecord.save();
    await feedingRecord.populate('animalId', 'name species breed');
    
    res.status(201).json(feedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update feeding record
router.put('/:id', auth, async (req, res) => {
  try {
    const feedingRecord = await FeedingRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!feedingRecord) {
      return res.status(404).json({ message: 'Feeding record not found' });
    }
    
    res.json(feedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete feeding record
router.delete('/:id', auth, async (req, res) => {
  try {
    const feedingRecord = await FeedingRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!feedingRecord) {
      return res.status(404).json({ message: 'Feeding record not found' });
    }
    
    res.json({ message: 'Feeding record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
