const mongoose = require('mongoose');

const livestockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  healthStatus: {
    type: String,
    required: true,
    enum: ['Healthy', 'Sick', 'Under Treatment', 'Recovered'],
    default: 'Healthy'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Livestock', livestockSchema);
