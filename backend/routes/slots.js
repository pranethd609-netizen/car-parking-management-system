const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/slots - list all slots (optional ?floor=1, ?status=available, ?type=EV)
router.get('/', (req, res) => {
  try {
    let slots = db.getAllSlots();
    const { floor, status, type } = req.query;

    if (floor) {
      slots = slots.filter(s => s.floor === parseInt(floor, 10));
    }
    if (status) {
      slots = slots.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    if (type) {
      slots = slots.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }

    res.json({ success: true, count: slots.length, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/slots/:id - get single slot
router.get('/:id', (req, res) => {
  try {
    const slot = db.getSlot(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/slots/:id/status - update slot status
router.put('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const slot = db.getSlot(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Slot not found' });
    }

    if (slot.status === 'occupied' && status !== 'occupied') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change status of an occupied slot directly. Please check out the vehicle first.'
      });
    }

    const updated = db.updateSlotStatus(req.params.id, status);
    res.json({ success: true, data: updated, message: `Slot ${req.params.id} marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/slots/:id/reserve - reserve slot for customer
router.post('/:id/reserve', (req, res) => {
  try {
    const { customerName, customerPhone, reservedUntil, notes } = req.body;
    if (!customerName) {
      return res.status(400).json({ success: false, error: 'Customer name is required to make a reservation' });
    }

    const slot = db.reserveSlot(req.params.id, {
      customerName,
      customerPhone,
      reservedUntil,
      notes
    });

    res.json({
      success: true,
      message: `Bay ${slot.id} reserved for ${customerName}`,
      data: slot
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/slots/:id/cancel-reservation - cancel reservation and make available
router.post('/:id/cancel-reservation', (req, res) => {
  try {
    const slot = db.cancelReservation(req.params.id);
    res.json({
      success: true,
      message: `Reservation for bay ${slot.id} has been cancelled`,
      data: slot
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
