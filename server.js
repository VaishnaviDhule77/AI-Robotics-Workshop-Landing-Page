const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// CORS fix
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// In-memory storage - no MongoDB needed
let enquiries = [];

// POST /api/enquiry
app.post('/api/enquiry', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }

  const { name, email, phone, workshop, ageGroup, startDate } = req.body;
  const entry = {
    id: 'ENQ-' + Date.now(),
    name, email, phone,
    workshop: workshop || 'AI & Robotics Summer Workshop',
    ageGroup: ageGroup || '8-14',
    startDate: startDate || '2026-07-15',
    createdAt: new Date().toISOString()
  };
  enquiries.push(entry);

  return res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully!',
    data: entry
  });
});

// GET /api/enquiry
app.get('/api/enquiry', (req, res) => {
  res.json({ success: true, count: enquiries.length, data: enquiries });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  🚀 Kidrove API Server');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📝 POST http://localhost:3000/api/enquiry');
  console.log('  📋 GET  http://localhost:3000/api/enquiry');
  console.log('  ━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Ready — No MongoDB needed!');
  console.log('');
});