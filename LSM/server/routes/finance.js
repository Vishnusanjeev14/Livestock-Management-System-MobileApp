const express = require('express');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

const router = express.Router();

// Expense Routes
// Get all expenses for a user
router.get('/expenses', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new expense
router.post('/expenses', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user.userId
    });
    
    await expense.save();
    await expense.populate('animalId', 'name species breed');
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update expense
router.put('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete expense
router.delete('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Income Routes
// Get all income for a user
router.get('/income', auth, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.userId })
      .populate('animalId', 'name species breed')
      .sort({ createdAt: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new income
router.post('/income', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.user.userId
    });
    
    await income.save();
    await income.populate('animalId', 'name species breed');
    
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update income
router.put('/income/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('animalId', 'name species breed');
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete income
router.delete('/income/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Financial Reports
// Get financial summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        incomeDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        expenseDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    }
    
    const [totalIncome, totalExpenses, incomeByCategory, expensesByCategory] = await Promise.all([
      Income.aggregate([
        { $match: { userId: req.user.userId, ...(dateFilter.incomeDate ? { incomeDate: dateFilter.incomeDate } : {}) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: req.user.userId, ...(dateFilter.expenseDate ? { expenseDate: dateFilter.expenseDate } : {}) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { userId: req.user.userId, ...(dateFilter.incomeDate ? { incomeDate: dateFilter.incomeDate } : {}) } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: req.user.userId, ...(dateFilter.expenseDate ? { expenseDate: dateFilter.expenseDate } : {}) } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);
    
    const summary = {
      totalIncome: totalIncome[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
      incomeByCategory,
      expensesByCategory
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
