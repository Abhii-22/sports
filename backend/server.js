const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5004;

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://sports-eosin-one.vercel.app', // Your Vercel frontend URL
    'https://sports-7-rikt.onrender.com' // Your Render backend URL
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Add cache control middleware for video files
app.use('/uploads', (req, res, next) => {
  if (req.url.match(/\.(mp4|mov|avi|webm)$/)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Serve static files with proper MIME types
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (path.endsWith('.avi')) {
      res.setHeader('Content-Type', 'video/x-msvideo');
    } else if (path.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
  }
}));

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
