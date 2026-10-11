const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/analytics - detailed business analytics and breakdowns
router.get('/', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/export/csv - download transaction history as CSV
router.get('/export/csv', (req, res) => {
  try {
    const csvContent = db.exportCSV();
    const filename = `parking_report_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
