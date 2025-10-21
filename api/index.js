// Vercel serverless function handler
const express = require('express');

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sikecil Pintar API is running' });
});

// Placeholder for API routes - these will be replaced by actual implementation
app.post('/api/analyze-image', (req, res) => {
  res.status(503).json({ 
    message: 'Service temporarily unavailable. Please configure API keys in Vercel environment variables.' 
  });
});

app.post('/api/analyze-camera', (req, res) => {
  res.status(503).json({ 
    message: 'Service temporarily unavailable. Please configure API keys in Vercel environment variables.' 
  });
});

module.exports = app;
