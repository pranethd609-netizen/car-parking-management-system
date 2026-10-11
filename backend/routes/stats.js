const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/stats - get high-level dashboard metrics
router.get('/', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/stats/reset - reset system data to defaults
router.post('/reset', (req, res) => {
  try {
    const result = db.resetDatabase();
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
