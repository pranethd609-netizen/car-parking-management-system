const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/tariffs - get all vehicle hourly tariffs
router.get('/', (req, res) => {
  try {
    const tariffs = db.getTariffs();
    res.json({ success: true, data: tariffs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/tariffs - update vehicle hourly tariffs
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Tariffs payload must be an object' });
    }

    // Ensure all values are positive numbers
    const cleaned = {};
    for (const [key, val] of Object.entries(updates)) {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, error: `Invalid rate for ${key}: must be a non-negative number` });
      }
      cleaned[key] = Number(num.toFixed(2));
    }

    const updated = db.updateTariffs(cleaned);
    res.json({
      success: true,
      message: 'Tariff rates updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
