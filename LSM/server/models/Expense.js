const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expenseDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Feed', 'Medicine', 'Equipment', 'Labor', 'Veterinary', 'Utilities', 'Transport', 'Other'],
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
  supplier: {
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

module.exports = mongoose.model('Expense', expenseSchema);
