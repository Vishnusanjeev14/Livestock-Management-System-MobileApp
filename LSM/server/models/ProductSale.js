const mongoose = require('mongoose');

const productSaleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  },
  saleDate: {
    type: Date,
    required: true
  },
  productType: {
    type: String,
    required: true,
    enum: ['Milk', 'Eggs', 'Meat', 'Wool', 'Cheese', 'Butter', 'Other'],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['Liters', 'Pieces', 'Kilograms', 'Grams', 'Pounds', 'Other'],
    trim: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  buyerContact: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductSale', productSaleSchema);
