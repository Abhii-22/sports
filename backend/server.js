const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected successfully');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
} else {
  console.log('MONGO_URI not found - running without database');
}

// Define Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', port: PORT });
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/post'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
