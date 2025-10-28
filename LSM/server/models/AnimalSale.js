const mongoose = require('mongoose');

const animalSaleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock',
    required: true
  },
  saleDate: {
    type: Date,
    required: true
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
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  saleReason: {
    type: String,
    enum: ['Breeding', 'Meat', 'Dairy', 'Wool', 'Other'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnimalSale', animalSaleSchema);
