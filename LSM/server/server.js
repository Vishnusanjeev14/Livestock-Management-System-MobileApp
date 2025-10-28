const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

// Import routes
const authRoutes = require('./routes/auth');
const livestockRoutes = require('./routes/livestock');
const breedingRoutes = require('./routes/breeding');
const feedingRoutes = require('./routes/feeding');
const healthRoutes = require('./routes/health');
const productionRoutes = require('./routes/production');
const veterinaryRoutes = require('./routes/veterinary');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const financeRoutes = require('./routes/finance');
const staffRoutes = require('./routes/staff');
const environmentRoutes = require('./routes/environment');
const schedulerRoutes = require('./routes/scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/breeding', breedingRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/veterinary', veterinaryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Livestock Management API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = config.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
