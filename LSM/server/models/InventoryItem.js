const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Feed', 'Medicine', 'Equipment', 'Supplies', 'Other'],
    trim: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['Kilograms', 'Liters', 'Pieces', 'Bags', 'Bottles', 'Other'],
    trim: true
  },
  minimumStock: {
    type: Number,
    min: 0,
    default: 0
  },
  unitCost: {
    type: Number,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  supplierContact: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
