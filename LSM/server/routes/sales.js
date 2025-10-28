const express = require('express');
const AnimalSale = require('../models/AnimalSale');
const ProductSale = require('../models/ProductSale');
const auth = require('../middleware/auth');

const router = express.Router();

// Animal Sales Routes
// Get all animal sales for a user
router.get('/animals', auth, async (req, res) => {
  try {
    const animalSales = await AnimalSale.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(animalSales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new animal sale
router.post('/animals', auth, async (req, res) => {
  try {
    const animalSale = new AnimalSale({
      ...req.body,
      userId: req.user.userId
    });
    
    await animalSale.save();
    await animalSale.populate('animalId', 'name species breed');
    
    res.status(201).json(animalSale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update animal sale
router.put('/animals/:id', auth, async (req, res) => {
  try {
    const animalSale = await AnimalSale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!animalSale) {
      return res.status(404).json({ message: 'Animal sale not found' });
    }
    
    res.json(animalSale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete animal sale
router.delete('/animals/:id', auth, async (req, res) => {
  try {
    const animalSale = await AnimalSale.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!animalSale) {
      return res.status(404).json({ message: 'Animal sale not found' });
    }
    
    res.json({ message: 'Animal sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Product Sales Routes
// Get all product sales for a user
router.get('/products', auth, async (req, res) => {
  try {
    const productSales = await ProductSale.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(productSales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new product sale
router.post('/products', auth, async (req, res) => {
  try {
    const productSale = new ProductSale({
      ...req.body,
      userId: req.user.userId
    });
    
    await productSale.save();
    await productSale.populate('animalId', 'name species breed');
    
    res.status(201).json(productSale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product sale
router.put('/products/:id', auth, async (req, res) => {
  try {
    const productSale = await ProductSale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!productSale) {
      return res.status(404).json({ message: 'Product sale not found' });
    }
    
    res.json(productSale);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product sale
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const productSale = await ProductSale.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!productSale) {
      return res.status(404).json({ message: 'Product sale not found' });
    }
    
    res.json({ message: 'Product sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
