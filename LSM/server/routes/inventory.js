const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all inventory items for a user
router.get('/', auth, async (req, res) => {
  try {
    const inventoryItems = await InventoryItem.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new inventory item
router.post('/', auth, async (req, res) => {
  try {
    const inventoryItem = new InventoryItem({
      ...req.body,
      userId: req.user.userId
    });
    
    await inventoryItem.save();
    
    res.status(201).json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const inventoryItem = await InventoryItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      userId: req.user.userId,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
