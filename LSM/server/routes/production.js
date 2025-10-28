const express = require('express');
const ProductionRecord = require('../models/ProductionRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all production records for a user
router.get('/', auth, async (req, res) => {
  try {
    const productionRecords = await ProductionRecord.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(productionRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single production record
router.get('/:id', auth, async (req, res) => {
  try {
    const productionRecord = await ProductionRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed');
    
    if (!productionRecord) {
      return res.status(404).json({ message: 'Production record not found' });
    }
    
    res.json(productionRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new production record
router.post('/', auth, async (req, res) => {
  try {
    const productionRecord = new ProductionRecord({
      ...req.body,
      userId: req.user.userId
    });
    
    await productionRecord.save();
    await productionRecord.populate('animalId', 'name species breed');
    
    res.status(201).json(productionRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update production record
router.put('/:id', auth, async (req, res) => {
  try {
    const productionRecord = await ProductionRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!productionRecord) {
      return res.status(404).json({ message: 'Production record not found' });
    }
    
    res.json(productionRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete production record
router.delete('/:id', auth, async (req, res) => {
  try {
    const productionRecord = await ProductionRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!productionRecord) {
      return res.status(404).json({ message: 'Production record not found' });
    }
    
    res.json({ message: 'Production record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
