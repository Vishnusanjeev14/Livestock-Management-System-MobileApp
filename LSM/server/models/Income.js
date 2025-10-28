const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  incomeDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Animal Sale', 'Product Sale', 'Milk', 'Eggs', 'Meat', 'Wool', 'Other'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  },
  buyer: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Other'],
    default: 'Cash'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
