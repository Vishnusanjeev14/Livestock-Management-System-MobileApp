const express = require('express');
const VeterinaryRecord = require('../models/VeterinaryRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all veterinary records for a user
router.get('/', auth, async (req, res) => {
  try {
    const veterinaryRecords = await VeterinaryRecord.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(veterinaryRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single veterinary record
router.get('/:id', auth, async (req, res) => {
  try {
    const veterinaryRecord = await VeterinaryRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed');
    
    if (!veterinaryRecord) {
      return res.status(404).json({ message: 'Veterinary record not found' });
    }
    
    res.json(veterinaryRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new veterinary record
router.post('/', auth, async (req, res) => {
  try {
    const veterinaryRecord = new VeterinaryRecord({
      ...req.body,
      userId: req.user.userId
    });
    
    await veterinaryRecord.save();
    await veterinaryRecord.populate('animalId', 'name species breed');
    
    res.status(201).json(veterinaryRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update veterinary record
router.put('/:id', auth, async (req, res) => {
  try {
    const veterinaryRecord = await VeterinaryRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!veterinaryRecord) {
      return res.status(404).json({ message: 'Veterinary record not found' });
    }
    
    res.json(veterinaryRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete veterinary record
router.delete('/:id', auth, async (req, res) => {
  try {
    const veterinaryRecord = await VeterinaryRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!veterinaryRecord) {
      return res.status(404).json({ message: 'Veterinary record not found' });
    }
    
    res.json({ message: 'Veterinary record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
