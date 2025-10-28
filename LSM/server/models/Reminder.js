const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  },
  reminderType: {
    type: String,
    required: true,
    enum: ['Vaccination', 'Breeding Check', 'Feeding', 'Health Check', 'Milking', 'Cleaning', 'Other'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);
