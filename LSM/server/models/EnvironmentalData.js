const mongoose = require('mongoose');

const environmentalDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  date: {
    type: Date,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  waterLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  rainfall: {
    type: Number,
    min: 0
  },
  windSpeed: {
    type: Number,
    min: 0
  },
  weatherCondition: {
    type: String,
    enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Snowy'],
    required: true
  },
  airQuality: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Hazardous']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnvironmentalData', environmentalDataSchema);
