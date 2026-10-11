const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'parking_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial seed data generator
function generateSeedData() {
  const now = Date.now();
  const tariffs = {
    Motorcycle: 1.5,
    Sedan: 3.0,
    SUV: 4.5,
    EV: 4.0,
    Truck: 7.0
  };

  const slots = [
    // Floor 1: Ground Floor (Standard & EV)
    { id: 'A-01', floor: 1, type: 'Sedan', status: 'occupied', currentTicketId: 'TKT-1001', reservation: null },
    { id: 'A-02', floor: 1, type: 'Sedan', status: 'occupied', currentTicketId: 'TKT-1002', reservation: null },
    { id: 'A-03', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-04', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-05', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-06', floor: 1, type: 'Sedan', status: 'maintenance', currentTicketId: null, reservation: null },
    { id: 'A-07', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-08', floor: 1, type: 'Sedan', status: 'occupied', currentTicketId: 'TKT-1003', reservation: null },
    { id: 'A-09', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-10', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-11', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'A-12', floor: 1, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'EV-01', floor: 1, type: 'EV', status: 'occupied', currentTicketId: 'TKT-1004', reservation: null },
    { id: 'EV-02', floor: 1, type: 'EV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'EV-03', floor: 1, type: 'EV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'EV-04', floor: 1, type: 'EV', status: 'available', currentTicketId: null, reservation: null },

    // Floor 2: Level 2 (SUVs & VIP Parking)
    { id: 'B-01', floor: 2, type: 'SUV', status: 'occupied', currentTicketId: 'TKT-1005', reservation: null },
    { id: 'B-02', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-03', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-04', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-05', floor: 2, type: 'SUV', status: 'occupied', currentTicketId: 'TKT-1006', reservation: null },
    { id: 'B-06', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-07', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-08', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-09', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-10', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-11', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'B-12', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    {
      id: 'VIP-01',
      floor: 2,
      type: 'Sedan',
      status: 'reserved',
      currentTicketId: null,
      reservation: {
        customerName: 'Ambassador Office',
        customerPhone: '+91 99000 11223',
        reservedUntil: new Date(now + 1000 * 60 * 60 * 6).toISOString(),
        notes: 'Diplomatic delegation'
      }
    },
    { id: 'VIP-02', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'VIP-03', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },
    { id: 'VIP-04', floor: 2, type: 'SUV', status: 'available', currentTicketId: null, reservation: null },

    // Floor 3: Level 3 (General & Motorcycles)
    { id: 'C-01', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-02', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-03', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-04', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-05', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-06', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-07', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-08', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-09', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'C-10', floor: 3, type: 'Sedan', status: 'available', currentTicketId: null, reservation: null },
    { id: 'M-01', floor: 3, type: 'Motorcycle', status: 'occupied', currentTicketId: 'TKT-1007', reservation: null },
    { id: 'M-02', floor: 3, type: 'Motorcycle', status: 'available', currentTicketId: null, reservation: null },
    { id: 'M-03', floor: 3, type: 'Motorcycle', status: 'available', currentTicketId: null, reservation: null },
    { id: 'M-04', floor: 3, type: 'Motorcycle', status: 'available', currentTicketId: null, reservation: null },
    { id: 'M-05', floor: 3, type: 'Motorcycle', status: 'available', currentTicketId: null, reservation: null },
    { id: 'M-06', floor: 3, type: 'Motorcycle', status: 'available', currentTicketId: null, reservation: null }
  ];

  // Active tickets matching the occupied slots
  const activeTickets = [
    {
      id: 'TKT-1001',
      plateNumber: 'KA-01-AB-1234',
      vehicleType: 'Sedan',
      slotId: 'A-01',
      driverName: 'Rahul Sharma',
      driverPhone: '+91 98765 43210',
      entryTime: new Date(now - 1000 * 60 * 145).toISOString(),
      ratePerHour: 3.0,
      status: 'active'
    },
    {
      id: 'TKT-1002',
      plateNumber: 'MH-12-PQ-9081',
      vehicleType: 'Sedan',
      slotId: 'A-02',
      driverName: 'Priya Patel',
      driverPhone: '+91 98451 22334',
      entryTime: new Date(now - 1000 * 60 * 65).toISOString(),
      ratePerHour: 3.0,
      status: 'active'
    },
    {
      id: 'TKT-1003',
      plateNumber: 'DL-04-CA-7722',
      vehicleType: 'Sedan',
      slotId: 'A-08',
      driverName: 'Amit Verma',
      driverPhone: '+91 99112 33445',
      entryTime: new Date(now - 1000 * 60 * 35).toISOString(),
      ratePerHour: 3.0,
      status: 'active'
    },
    {
      id: 'TKT-1004',
      plateNumber: 'TS-09-EV-4411',
      vehicleType: 'EV',
      slotId: 'EV-01',
      driverName: 'Sunita Reddy',
      driverPhone: '+91 90001 88776',
      entryTime: new Date(now - 1000 * 60 * 190).toISOString(),
      ratePerHour: 4.0,
      status: 'active'
    },
    {
      id: 'TKT-1005',
      plateNumber: 'HR-26-BR-5566',
      vehicleType: 'SUV',
      slotId: 'B-01',
      driverName: 'Vikram Singh',
      driverPhone: '+91 98100 99887',
      entryTime: new Date(now - 1000 * 60 * 220).toISOString(),
      ratePerHour: 4.5,
      status: 'active'
    },
    {
      id: 'TKT-1006',
      plateNumber: 'TN-07-JK-3401',
      vehicleType: 'SUV',
      slotId: 'B-05',
      driverName: 'Karthik Raja',
      driverPhone: '+91 94441 55667',
      entryTime: new Date(now - 1000 * 60 * 50).toISOString(),
      ratePerHour: 4.5,
      status: 'active'
    },
    {
      id: 'TKT-1007',
      plateNumber: 'GJ-01-MZ-6623',
      vehicleType: 'Motorcycle',
      slotId: 'M-01',
      driverName: 'Devang Joshi',
      driverPhone: '+91 97234 11223',
      entryTime: new Date(now - 1000 * 60 * 110).toISOString(),
      ratePerHour: 1.5,
      status: 'active'
    }
  ];

  // Completed history tickets with revenue
  const historyTickets = [
    {
      id: 'TKT-0998',
      plateNumber: 'KA-05-MN-4321',
      vehicleType: 'Sedan',
      slotId: 'A-04',
      driverName: 'John Doe',
      driverPhone: '+91 98888 11111',
      entryTime: new Date(now - 1000 * 60 * 360).toISOString(),
      exitTime: new Date(now - 1000 * 60 * 180).toISOString(),
      durationHours: 3.0,
      durationMinutes: 180,
      ratePerHour: 3.0,
      subtotal: 9.0,
      tax: 0.72,
      discount: 0,
      totalAmount: 9.72,
      paymentMethod: 'Credit Card',
      status: 'completed'
    },
    {
      id: 'TKT-0997',
      plateNumber: 'DL-01-XY-9999',
      vehicleType: 'SUV',
      slotId: 'B-02',
      driverName: 'Anil Kapoor',
      driverPhone: '+91 98711 22334',
      entryTime: new Date(now - 1000 * 60 * 420).toISOString(),
      exitTime: new Date(now - 1000 * 60 * 240).toISOString(),
      durationHours: 3.0,
      durationMinutes: 180,
      ratePerHour: 4.5,
      subtotal: 13.5,
      tax: 1.08,
      discount: 0,
      totalAmount: 14.58,
      paymentMethod: 'UPI / QR',
      status: 'completed'
    },
    {
      id: 'TKT-0996',
      plateNumber: 'MH-02-EE-1122',
      vehicleType: 'EV',
      slotId: 'EV-02',
      driverName: 'Sanjay Dutt',
      driverPhone: '+91 98200 44556',
      entryTime: new Date(now - 1000 * 60 * 300).toISOString(),
      exitTime: new Date(now - 1000 * 60 * 120).toISOString(),
      durationHours: 3.0,
      durationMinutes: 180,
      ratePerHour: 4.0,
      subtotal: 12.0,
      tax: 0.96,
      discount: 0,
      totalAmount: 12.96,
      paymentMethod: 'Cash',
      status: 'completed'
    },
    {
      id: 'TKT-0995',
      plateNumber: 'KA-03-JJ-7788',
      vehicleType: 'Motorcycle',
      slotId: 'M-02',
      driverName: 'Gaurav Roy',
      driverPhone: '+91 99887 66554',
      entryTime: new Date(now - 1000 * 60 * 280).toISOString(),
      exitTime: new Date(now - 1000 * 60 * 160).toISOString(),
      durationHours: 2.0,
      durationMinutes: 120,
      ratePerHour: 1.5,
      subtotal: 3.0,
      tax: 0.24,
      discount: 0,
      totalAmount: 3.24,
      paymentMethod: 'UPI / QR',
      status: 'completed'
    }
  ];

  return {
    tariffs,
    slots,
    activeTickets,
    historyTickets,
    ticketCounter: 1008
  };
}

class Database {
  constructor() {
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure slots have reservation field
        this.data.slots.forEach(s => {
          if (s.reservation === undefined) s.reservation = null;
        });
      } else {
        this.data = generateSeedData();
        this.save();
      }
    } catch (err) {
      console.error('Error reading database file, regenerating seed data:', err);
      this.data = generateSeedData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  getAllSlots() {
    return this.data.slots;
  }

  getSlot(slotId) {
    return this.data.slots.find(s => s.id === slotId);
  }

  updateSlotStatus(slotId, status) {
    const slot = this.getSlot(slotId);
    if (!slot) return null;
    slot.status = status;
    if (status !== 'reserved') {
      slot.reservation = null;
    }
    this.save();
    return slot;
  }

  reserveSlot(slotId, { customerName, customerPhone = '', reservedUntil = '', notes = '' }) {
    const slot = this.getSlot(slotId);
    if (!slot) throw new Error(`Slot ${slotId} not found`);
    if (slot.status === 'occupied') throw new Error(`Cannot reserve slot ${slotId}: currently occupied`);

    slot.status = 'reserved';
    slot.reservation = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      reservedUntil: reservedUntil || new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      notes: notes.trim(),
      reservedAt: new Date().toISOString()
    };
    this.save();
    return slot;
  }

  cancelReservation(slotId) {
    const slot = this.getSlot(slotId);
    if (!slot) throw new Error(`Slot ${slotId} not found`);
    slot.status = 'available';
    slot.reservation = null;
    this.save();
    return slot;
  }

  getTariffs() {
    return this.data.tariffs;
  }

  updateTariffs(newTariffs) {
    this.data.tariffs = { ...this.data.tariffs, ...newTariffs };
    this.save();
    return this.data.tariffs;
  }

  getActiveTickets() {
    return this.data.activeTickets;
  }

  getHistoryTickets() {
    return this.data.historyTickets;
  }

  getTicketById(ticketId) {
    const active = this.data.activeTickets.find(t => t.id === ticketId);
    if (active) return active;
    return this.data.historyTickets.find(t => t.id === ticketId);
  }

  findActiveTicketByPlate(plateNumber) {
    const cleaned = plateNumber.trim().toUpperCase();
    return this.data.activeTickets.find(t => t.plateNumber.toUpperCase() === cleaned);
  }

  findActiveTicketBySlot(slotId) {
    return this.data.activeTickets.find(t => t.slotId === slotId);
  }

  checkIn({ plateNumber, vehicleType, driverName = '', driverPhone = '', preferredSlot = '' }) {
    if (!plateNumber || !vehicleType) {
      throw new Error('Plate number and vehicle type are required');
    }

    const cleanPlate = plateNumber.trim().toUpperCase();

    // Check if vehicle is already parked
    const existing = this.findActiveTicketByPlate(cleanPlate);
    if (existing) {
      throw new Error(`Vehicle ${cleanPlate} is already parked at slot ${existing.slotId}`);
    }

    let targetSlot = null;

    if (preferredSlot) {
      targetSlot = this.getSlot(preferredSlot);
      if (!targetSlot) {
        throw new Error(`Slot ${preferredSlot} not found`);
      }
      if (targetSlot.status !== 'available' && targetSlot.status !== 'reserved') {
        throw new Error(`Slot ${preferredSlot} is not available (Current status: ${targetSlot.status})`);
      }
    } else {
      // Auto-assign: Find first available slot matching vehicle type, or general type
      targetSlot = this.data.slots.find(s => s.status === 'available' && s.type.toLowerCase() === vehicleType.toLowerCase());
      if (!targetSlot) {
        targetSlot = this.data.slots.find(s => s.status === 'available' && (vehicleType === 'EV' || s.type !== 'EV'));
      }
    }

    if (!targetSlot) {
      throw new Error('No available parking slot found for this vehicle category');
    }

    const ticketId = `TKT-${this.data.ticketCounter++}`;
    const ratePerHour = this.data.tariffs[vehicleType] || 3.0;

    const newTicket = {
      id: ticketId,
      plateNumber: cleanPlate,
      vehicleType,
      slotId: targetSlot.id,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      entryTime: new Date().toISOString(),
      ratePerHour,
      status: 'active'
    };

    targetSlot.status = 'occupied';
    targetSlot.currentTicketId = ticketId;
    targetSlot.reservation = null;

    this.data.activeTickets.unshift(newTicket);
    this.save();

    return { ticket: newTicket, slot: targetSlot };
  }

  checkOut(ticketIdOrPlateOrSlot, { paymentMethod = 'Cash', discountPercent = 0 } = {}) {
    const query = ticketIdOrPlateOrSlot.trim();
    let ticket = this.data.activeTickets.find(
      t => t.id === query || t.plateNumber.toUpperCase() === query.toUpperCase() || t.slotId.toUpperCase() === query.toUpperCase()
    );

    if (!ticket) {
      throw new Error(`No active parking session found for '${query}'`);
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

    const completedTicket = {
      ...ticket,
      exitTime: exitTime.toISOString(),
      durationMinutes: diffMins,
      durationHours: billedHours,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      status: 'completed'
    };

    this.data.activeTickets = this.data.activeTickets.filter(t => t.id !== ticket.id);
    this.data.historyTickets.unshift(completedTicket);

    const slot = this.getSlot(ticket.slotId);
    if (slot) {
      slot.status = 'available';
      slot.currentTicketId = null;
    }

    this.save();
    return { receipt: completedTicket, slot };
  }

  getStats() {
    const totalSlots = this.data.slots.length;
    const occupiedSlots = this.data.slots.filter(s => s.status === 'occupied').length;
    const availableSlots = this.data.slots.filter(s => s.status === 'available').length;
    const reservedSlots = this.data.slots.filter(s => s.status === 'reserved').length;
    const maintenanceSlots = this.data.slots.filter(s => s.status === 'maintenance').length;
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    const totalRevenue = this.data.historyTickets.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const vehicleTypeCounts = {};
    for (const ticket of this.data.activeTickets) {
      vehicleTypeCounts[ticket.vehicleType] = (vehicleTypeCounts[ticket.vehicleType] || 0) + 1;
    }

    const floorStats = {
      1: { total: 0, occupied: 0, available: 0, reserved: 0 },
      2: { total: 0, occupied: 0, available: 0, reserved: 0 },
      3: { total: 0, occupied: 0, available: 0, reserved: 0 }
    };

    for (const slot of this.data.slots) {
      if (floorStats[slot.floor]) {
        floorStats[slot.floor].total++;
        if (slot.status === 'occupied') floorStats[slot.floor].occupied++;
        if (slot.status === 'available') floorStats[slot.floor].available++;
        if (slot.status === 'reserved') floorStats[slot.floor].reserved++;
      }
    }

    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      reservedSlots,
      maintenanceSlots,
      occupancyRate,
      activeVehiclesCount: this.data.activeTickets.length,
      completedSessionsCount: this.data.historyTickets.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      vehicleTypeCounts,
      floorStats
    };
  }

  getAnalytics() {
    const history = this.data.historyTickets;
    const totalSessions = history.length;
    const totalRevenue = history.reduce((sum, h) => sum + (h.totalAmount || 0), 0);
    const avgDuration = totalSessions > 0
      ? (history.reduce((sum, h) => sum + (h.durationHours || 1), 0) / totalSessions).toFixed(1)
      : 0;

    // Payment methods breakdown
    const paymentBreakdown = {};
    history.forEach(h => {
      const method = h.paymentMethod || 'Cash';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + h.totalAmount;
    });

    // Revenue by Vehicle Type
    const vehicleRevenue = {};
    history.forEach(h => {
      const type = h.vehicleType || 'Sedan';
      vehicleRevenue[type] = (vehicleRevenue[type] || 0) + h.totalAmount;
    });

    // Floor Occupancy Rate
    const stats = this.getStats();

    return {
      totalSessions,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageDurationHours: parseFloat(avgDuration),
      paymentBreakdown,
      vehicleRevenue,
      floorStats: stats.floorStats,
      occupancyRate: stats.occupancyRate
    };
  }

  exportCSV() {
    const history = this.data.historyTickets;
    const headers = [
      'Ticket ID',
      'License Plate',
      'Vehicle Type',
      'Bay ID',
      'Driver Name',
      'Driver Phone',
      'Entry Time',
      'Exit Time',
      'Duration (Hours)',
      'Hourly Rate',
      'Subtotal',
      'Discount',
      'Tax',
      'Total Amount',
      'Payment Method',
      'Status'
    ];

    const rows = history.map(h => [
      h.id,
      h.plateNumber,
      h.vehicleType,
      h.slotId,
      `"${(h.driverName || '').replace(/"/g, '""')}"`,
      `"${(h.driverPhone || '').replace(/"/g, '""')}"`,
      h.entryTime,
      h.exitTime,
      h.durationHours,
      h.ratePerHour,
      h.subtotal,
      h.discount,
      h.tax,
      h.totalAmount,
      h.paymentMethod,
      h.status
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  resetDatabase() {
    this.data = generateSeedData();
    this.save();
    return { message: 'Database reset to default seed data successfully' };
  }
}

module.exports = new Database();
