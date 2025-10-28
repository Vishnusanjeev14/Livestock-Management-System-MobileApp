const express = require('express');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all reminders
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, status, reminderType } = req.query;
    
    let filter = { userId: req.user.userId };
    if (status) filter.status = status;
    if (reminderType) filter.reminderType = reminderType;
    if (startDate && endDate) {
      filter.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const reminders = await Reminder.find(filter)
      .populate('animalId', 'name species breed')
      .sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single reminder
router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    })
    .populate('animalId', 'name species breed');
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new reminder
router.post('/', auth, async (req, res) => {
  try {
    const reminder = new Reminder({
      ...req.body,
      userId: req.user.userId
    });
    
    await reminder.save();
    await reminder.populate('animalId', 'name species breed');
    
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming/list', auth, async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = await Reminder.find({
      userId: req.user.userId,
      status: 'Pending',
      dueDate: { $gte: today, $lte: nextWeek }
    })
    .populate('animalId', 'name species breed')
    .sort({ dueDate: 1 });
    
    res.json(upcomingReminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark reminder as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { 
        status: 'Completed',
        completedDate: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard summary
router.get('/dashboard/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const [totalReminders, pendingReminders, overdueReminders, upcomingReminders] = await Promise.all([
      Reminder.countDocuments({ userId: req.user.userId }),
      Reminder.countDocuments({ userId: req.user.userId, status: 'Pending' }),
      Reminder.countDocuments({ 
        userId: req.user.userId, 
        status: 'Pending', 
        dueDate: { $lt: today } 
      }),
      Reminder.countDocuments({ 
        userId: req.user.userId, 
        status: 'Pending', 
        dueDate: { $gte: today, $lte: nextWeek } 
      })
    ]);
    
    const summary = {
      totalReminders,
      pendingReminders,
      overdueReminders,
      upcomingReminders
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
