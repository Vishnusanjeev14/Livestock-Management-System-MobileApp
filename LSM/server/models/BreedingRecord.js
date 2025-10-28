const mongoose = require('mongoose');

const breedingRecordSchema = new mongoose.Schema({
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
  partnerAnimalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock',
    required: true
  },
  breedingDate: {
    type: Date,
    required: true
  },
  outcome: {
    type: String,
    required: true,
    enum: ['Successful', 'Unsuccessful', 'Pending', 'Unknown']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BreedingRecord', breedingRecordSchema);
