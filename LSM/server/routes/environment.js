const express = require('express');
const EnvironmentalData = require('../models/EnvironmentalData');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all environmental data
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, city } = req.query;
    
    let filter = { userId: req.user.userId };
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const environmentalData = await EnvironmentalData.find(filter)
      .sort({ date: -1 });
    res.json(environmentalData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single environmental record
router.get('/:id', auth, async (req, res) => {
  try {
    const environmentalData = await EnvironmentalData.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!environmentalData) {
      return res.status(404).json({ message: 'Environmental data not found' });
    }
    
    res.json(environmentalData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new environmental data
router.post('/', auth, async (req, res) => {
  try {
    const environmentalData = new EnvironmentalData({
      ...req.body,
      userId: req.user.userId
    });
    
    await environmentalData.save();
    res.status(201).json(environmentalData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update environmental data
router.put('/:id', auth, async (req, res) => {
  try {
    const environmentalData = await EnvironmentalData.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!environmentalData) {
      return res.status(404).json({ message: 'Environmental data not found' });
    }
    
    res.json(environmentalData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete environmental data
router.delete('/:id', auth, async (req, res) => {
  try {
    const environmentalData = await EnvironmentalData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!environmentalData) {
      return res.status(404).json({ message: 'Environmental data not found' });
    }
    
    res.json({ message: 'Environmental data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get weather forecast (mock data for now)
router.get('/forecast/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    
    // Mock weather forecast data
    const forecast = {
      city: city,
      current: {
        temperature: Math.floor(Math.random() * 30) + 10,
        humidity: Math.floor(Math.random() * 40) + 40,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
        windSpeed: Math.floor(Math.random() * 20) + 5
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        temperature: {
          high: Math.floor(Math.random() * 30) + 15,
          low: Math.floor(Math.random() * 15) + 5
        },
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40,
        rainfall: Math.floor(Math.random() * 20)
      }))
    };
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available cities
router.get('/cities/list', auth, async (req, res) => {
  try {
    const cities = await EnvironmentalData.distinct('location.city', { userId: req.user.userId });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
