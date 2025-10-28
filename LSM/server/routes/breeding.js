const express = require('express');
const BreedingRecord = require('../models/BreedingRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all breeding records for a user
router.get('/', auth, async (req, res) => {
  try {
    const breedingRecords = await BreedingRecord.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .populate('partnerAnimalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(breedingRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single breeding record
router.get('/:id', auth, async (req, res) => {
  try {
    const breedingRecord = await BreedingRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed')
    .populate('partnerAnimalId', 'name species breed');
    
    if (!breedingRecord) {
      return res.status(404).json({ message: 'Breeding record not found' });
    }
    
    res.json(breedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new breeding record
router.post('/', auth, async (req, res) => {
  try {
    const breedingRecord = new BreedingRecord({
      ...req.body,
      userId: req.user.userId
    });
    
    await breedingRecord.save();
    await breedingRecord.populate([
      { path: 'animalId', select: 'name species breed' },
      { path: 'partnerAnimalId', select: 'name species breed' }
    ]);
    
    res.status(201).json(breedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update breeding record
router.put('/:id', auth, async (req, res) => {
  try {
    const breedingRecord = await BreedingRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed')
    .populate('partnerAnimalId', 'name species breed');
    
    if (!breedingRecord) {
      return res.status(404).json({ message: 'Breeding record not found' });
    }
    
    res.json(breedingRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete breeding record
router.delete('/:id', auth, async (req, res) => {
  try {
    const breedingRecord = await BreedingRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!breedingRecord) {
      return res.status(404).json({ message: 'Breeding record not found' });
    }
    
    res.json({ message: 'Breeding record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
