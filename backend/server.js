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
const allowedOrigins = [
  'http://localhost:3000',
  'https://sports-eosin-one.vercel.app',
  'https://sports-7-rikt.onrender.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow from main domains
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow from Vercel preview deployments
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
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

// Add cache control middleware for video files and CORS headers for all uploads
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for static files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url.match(/\.(mp4|mov|avi|webm)$/)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Serve static files with proper MIME types
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper content type based on file extension
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (filePath.endsWith('.avi')) {
      res.setHeader('Content-Type', 'video/x-msvideo');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    } else if (filePath.match(/\.(jpg|jpeg)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
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
