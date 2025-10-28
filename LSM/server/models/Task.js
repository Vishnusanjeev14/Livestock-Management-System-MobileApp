const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livestock'
  },
  taskType: {
    type: String,
    required: true,
    enum: ['Feeding', 'Milking', 'Cleaning', 'Health Check', 'Breeding', 'Vaccination', 'Other'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 0
  },
  actualDuration: {
    type: Number, // in minutes
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
