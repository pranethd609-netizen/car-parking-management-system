const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/tickets/active - all active parking tickets
router.get('/active', (req, res) => {
  try {
    const active = db.getActiveTickets();
    res.json({ success: true, count: active.length, data: active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tickets/history - completed parking records
router.get('/history', (req, res) => {
  try {
    const history = db.getHistoryTickets();
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tickets/:id - search by ticket ID or plate or slot
router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    let ticket = db.getTicketById(id);
    if (!ticket) {
      ticket = db.findActiveTicketByPlate(id) || db.findActiveTicketBySlot(id);
    }
    if (!ticket) {
      return res.status(404).json({ success: false, error: `Ticket not found for '${id}'` });
    }
    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tickets/checkin - check in a vehicle
router.post('/checkin', (req, res) => {
  try {
    const { plateNumber, vehicleType, driverName, driverPhone, preferredSlot } = req.body;

    if (!plateNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        error: 'Plate number and vehicle type are required fields.'
      });
    }

    const result = db.checkIn({
      plateNumber,
      vehicleType,
      driverName,
      driverPhone,
      preferredSlot
    });

    res.status(201).json({
      success: true,
      message: `Vehicle ${result.ticket.plateNumber} parked at slot ${result.ticket.slotId}`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/tickets/preview-bill - calculate bill without completing checkout
router.post('/preview-bill', (req, res) => {
  try {
    const { query, discountPercent = 0 } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query (Ticket ID, Plate, or Slot) is required' });
    }

    const ticket = db.findActiveTicketByPlate(query) || 
                   db.findActiveTicketBySlot(query) || 
                   db.getTicketById(query);

    if (!ticket || ticket.status !== 'active') {
      return res.status(404).json({ success: false, error: `No active ticket found for '${query}'` });
    }

    const exitTime = new Date();
    const entryTime = new Date(ticket.entryTime);
    const diffMs = exitTime - entryTime;
    const diffMins = Math.max(1, Math.ceil(diffMs / (1000 * 60)));
    let billedHours = Math.ceil(diffMins / 60);
    if (billedHours < 1) billedHours = 1;

    const subtotal = Number((billedHours * ticket.ratePerHour).toFixed(2));
    const discount = Number(((subtotal * (discountPercent || 0)) / 100).toFixed(2));
    const tax = Number(((subtotal - discount) * 0.08).toFixed(2));
    const totalAmount = Number((subtotal - discount + tax).toFixed(2));

    res.json({
      success: true,
      data: {
        ticket,
        currentTime: exitTime.toISOString(),
        durationMinutes: diffMins,
        durationHours: billedHours,
        ratePerHour: ticket.ratePerHour,
        subtotal,
        discount,
        tax,
        totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tickets/checkout - finalize checkout and payment
router.post('/checkout', (req, res) => {
  try {
    const { query, paymentMethod = 'Cash', discountPercent = 0 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Ticket ID, License Plate, or Slot ID is required for checkout'
      });
    }

    const result = db.checkOut(query, { paymentMethod, discountPercent });

    res.json({
      success: true,
      message: `Checkout complete for vehicle ${result.receipt.plateNumber}. Slot ${result.slot.id} is now available.`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
