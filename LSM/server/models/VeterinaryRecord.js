const mongoose = require('mongoose');

const veterinaryRecordSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  vetName: {
    type: String,
    required: true,
    trim: true
  },
  vetContact: {
    type: String,
    trim: true
  },
  visitType: {
    type: String,
    required: true,
    enum: ['Routine Checkup', 'Emergency', 'Vaccination', 'Treatment', 'Surgery', 'Other'],
    default: 'Routine Checkup'
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  treatment: {
    type: String,
    required: true,
    trim: true
  },
  medication: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  },
  nextVisitDate: {
    type: Date
  },
  cost: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VeterinaryRecord', veterinaryRecordSchema);
