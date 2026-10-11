/**
 * ParkFlow Pro - Main Application Logic (Enhanced)
 * Featuring Real-Time Visuals, Chart.js Analytics, QR Codes & Web Audio Synthesis
 */

let appState = {
  currentFloor: 1,
  statusFilter: 'all',
  typeFilter: 'all',
  searchQuery: '',
  slots: [],
  activeTickets: [],
  historyTickets: [],
  tariffs: {},
  stats: null,
  analytics: null,
  isOnline: true,
  soundEnabled: true
};

// Charts references
let floorChart = null;
let categoryChart = null;

// Audio Context for synthesized sound FX
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesized Sound Effects (No external audio files needed!)
function playChime(type) {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'checkin') {
      // Friendly ascending two-tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'checkout') {
      // Cash/success chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'alert') {
      // Soft alert beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSoundToggle();
  initEventListeners();
  loadAllData();

  // Auto-refresh data every 20 seconds
  setInterval(() => {
    loadAllData(true);
  }, 20000);
});

// Digital Clock
function initClock() {
  const clockEl = document.getElementById('digitalClock');
  const dateEl = document.getElementById('digitalDate');
  
  function updateTime() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// Sound toggle
function initSoundToggle() {
  const btn = document.getElementById('btnToggleSound');
  const stored = localStorage.getItem('parkflow_sound');
  if (stored !== null) {
    appState.soundEnabled = stored === 'true';
  }
  updateSoundButtonUI();

  if (btn) {
    btn.addEventListener('click', () => {
      appState.soundEnabled = !appState.soundEnabled;
      localStorage.setItem('parkflow_sound', appState.soundEnabled);
      updateSoundButtonUI();
      if (appState.soundEnabled) playChime('checkin');
    });
  }
}

function updateSoundButtonUI() {
  const btn = document.getElementById('btnToggleSound');
  if (!btn) return;
  if (appState.soundEnabled) {
    btn.innerHTML = '<i class="fa-solid fa-volume-high text-emerald-400"></i>';
    btn.title = 'Sound Effects: On';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-volume-xmark text-slate-500"></i>';
    btn.title = 'Sound Effects: Muted';
  }
}

// Event Listeners
function initEventListeners() {
  // Floor Tabs
  document.querySelectorAll('.floor-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.floor-tab').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');
      });
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');

      appState.currentFloor = parseInt(btn.dataset.floor, 10);
      renderParkingGrid();
    });
  });

  // Status Filter Tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.remove('bg-slate-700', 'text-white', 'border-slate-500');
        b.classList.add('text-slate-400', 'border-transparent');
      });
      btn.classList.add('bg-slate-700', 'text-white', 'border-slate-500');
      btn.classList.remove('text-slate-400', 'border-transparent');

      appState.statusFilter = btn.dataset.status;
      renderParkingGrid();
    });
  });

  // Search Input
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.trim().toLowerCase();
      renderParkingGrid();
      renderActiveVehiclesTable();
      renderHistoryTable();
    });
  }

  // Quick Action Buttons
  document.getElementById('btnQuickCheckIn')?.addEventListener('click', () => openCheckInModal());
  document.getElementById('btnQuickCheckOut')?.addEventListener('click', () => openCheckOutModal());
  document.getElementById('btnTariffRates')?.addEventListener('click', () => openTariffsModal());
  document.getElementById('btnExportCsv')?.addEventListener('click', handleExportCSV);
  document.getElementById('btnRefreshAll')?.addEventListener('click', () => {
    loadAllData();
    showToast('Dashboard data refreshed', 'info');
  });

  // Modal Closers
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) modal.classList.add('hidden');
    });
  });

  // Check-In Form Submit
  document.getElementById('checkInForm')?.addEventListener('submit', handleCheckInSubmit);

  // Check-Out Search & Calculation
  document.getElementById('checkoutQueryInput')?.addEventListener('input', debounce(handleCheckoutQueryChange, 400));
  document.getElementById('checkoutDiscountInput')?.addEventListener('input', debounce(handleCheckoutQueryChange, 400));
  document.getElementById('btnConfirmCheckout')?.addEventListener('click', handleConfirmCheckout);

  // Tariffs Form Submit
  document.getElementById('tariffsForm')?.addEventListener('submit', handleTariffsSubmit);

  // Reservation Form Submit
  document.getElementById('reservationForm')?.addEventListener('submit', handleReservationSubmit);
  document.getElementById('btnCancelReservation')?.addEventListener('click', handleCancelReservation);

  // Vehicle type select change in checkin form -> updates estimated rate display
  document.getElementById('checkinVehicleType')?.addEventListener('change', updateCheckinRateEstimate);
}

// Load All System Data
async function loadAllData(silent = false) {
  try {
    const [statsRes, slotsRes, activeRes, historyRes, tariffsRes, analyticsRes] = await Promise.all([
      api.getStats(),
      api.getSlots(),
      api.getActiveTickets(),
      api.getHistoryTickets(),
      api.getTariffs(),
      api.getAnalytics()
    ]);

    appState.stats = statsRes.data;
    appState.slots = slotsRes.data;
    appState.activeTickets = activeRes.data;
    appState.historyTickets = historyRes.data;
    appState.tariffs = tariffsRes.data;
    appState.analytics = analyticsRes.data;
    setConnectionStatus(true);

    renderStats();
    renderParkingGrid();
    renderActiveVehiclesTable();
    renderHistoryTable();
    renderCharts();
    populateAvailableSlotsSelect();
  } catch (err) {
    console.error('Failed to load parking data:', err);
    setConnectionStatus(false);
    if (!silent) {
      showToast('Backend connection error: ' + err.message, 'error');
    }
  }
}

function setConnectionStatus(online) {
  appState.isOnline = online;
  const badge = document.getElementById('connectionStatusBadge');
  if (!badge) return;

  if (online) {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-available"></span> System Online';
  } else {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Disconnected';
  }
}

// Render Header Stat Cards
function renderStats() {
  const s = appState.stats;
  if (!s) return;

  document.getElementById('statTotalSlots').textContent = s.totalSlots;
  document.getElementById('statOccupiedSlots').textContent = s.occupiedSlots;
  document.getElementById('statAvailableSlots').textContent = s.availableSlots;
  document.getElementById('statTotalRevenue').textContent = `$${s.totalRevenue.toFixed(2)}`;

  // Occupancy rate & progress bar
  const occRateEl = document.getElementById('statOccupancyRate');
  if (occRateEl) {
    occRateEl.textContent = `${s.occupancyRate}%`;
  }
  const progBar = document.getElementById('statOccupancyProgress');
  if (progBar) {
    progBar.style.width = `${s.occupancyRate}%`;
    progBar.className = s.occupancyRate > 85 ? 'h-full bg-rose-500' : s.occupancyRate > 60 ? 'h-full bg-amber-500' : 'h-full bg-emerald-500';
  }

  // Update Floor Badges
  if (s.floorStats) {
    for (let f = 1; f <= 3; f++) {
      const fStat = s.floorStats[f];
      const badge = document.getElementById(`floor${f}Badge`);
      if (badge && fStat) {
        badge.textContent = `${fStat.available} Free / ${fStat.total}`;
      }
    }
  }

  // Avg stay duration badge
  const avgDurationEl = document.getElementById('statAvgDuration');
  if (avgDurationEl && appState.analytics) {
    avgDurationEl.textContent = `${appState.analytics.averageDurationHours}h avg`;
  }
}

// Render 2D Parking Bay Grid
function renderParkingGrid() {
  const container = document.getElementById('parkingGridContainer');
  if (!container) return;

  let floorSlots = appState.slots.filter(s => s.floor === appState.currentFloor);

  // Apply Status Filter
  if (appState.statusFilter !== 'all') {
    floorSlots = floorSlots.filter(s => s.status === appState.statusFilter);
  }

  // Apply Search
  if (appState.searchQuery) {
    floorSlots = floorSlots.filter(slot => {
      const matchesSlot = slot.id.toLowerCase().includes(appState.searchQuery);
      const ticket = appState.activeTickets.find(t => t.slotId === slot.id);
      const matchesPlate = ticket && ticket.plateNumber.toLowerCase().includes(appState.searchQuery);
      const matchesDriver = ticket && ticket.driverName.toLowerCase().includes(appState.searchQuery);
      const matchesRes = slot.reservation && slot.reservation.customerName.toLowerCase().includes(appState.searchQuery);
      return matchesSlot || matchesPlate || matchesDriver || matchesRes;
    });
  }

  if (floorSlots.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <i class="fa-solid fa-square-parking text-4xl mb-3 text-slate-600 block"></i>
        <p class="text-base font-medium">No parking bays match the selected filters on Floor ${appState.currentFloor}.</p>
        <button onclick="resetFilters()" class="mt-3 px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = floorSlots.map(slot => {
    const ticket = appState.activeTickets.find(t => t.slotId === slot.id);
    let statusClass = 'bay-available';
    let statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">Available</span>';
    let centerContent = '';
    let footerContent = '';
    let icon = getVehicleIcon(slot.type);

    if (slot.status === 'occupied') {
      statusClass = 'bay-occupied';
      const durationStr = ticket ? formatDuration(ticket.entryTime) : '';
      const isOverstay = ticket && isVehicleOverstay(ticket.entryTime);

      statusBadge = isOverstay
        ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/50 uppercase tracking-wider pulse-overstay"><i class="fa-solid fa-clock-rotate-left mr-0.5"></i>>3h</span>'
        : '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">Occupied</span>';

      centerContent = `
        <div class="text-center my-1.5">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 text-xl mb-1 border border-rose-500/20">
            <i class="${getVehicleIcon(ticket ? ticket.vehicleType : slot.type)}"></i>
          </div>
          <div class="font-mono font-bold text-xs text-white bg-slate-900/90 px-2 py-1 rounded border border-slate-700 shadow-sm">
            ${ticket ? ticket.plateNumber : 'OCCUPIED'}
          </div>
        </div>
      `;
      footerContent = `
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span class="${isOverstay ? 'text-amber-400 font-semibold' : ''}"><i class="fa-regular fa-clock text-rose-400 mr-1"></i>${durationStr}</span>
          <button onclick="openCheckOutModal('${ticket ? ticket.plateNumber : slot.id}')" class="text-rose-400 hover:text-rose-300 font-medium hover:underline text-[11px]">Exit ➔</button>
        </div>
      `;
    } else if (slot.status === 'reserved') {
      statusClass = 'bay-reserved';
      const resName = slot.reservation?.customerName || 'VIP Guest';
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">Reserved</span>';
      centerContent = `
        <div class="text-center my-1.5 text-amber-400">
          <i class="fa-solid fa-crown text-2xl mb-1"></i>
          <p class="text-[11px] text-amber-300 font-bold truncate px-1" title="${resName}">${resName}</p>
        </div>
      `;
      footerContent = `
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <button onclick="openReservationModal('${slot.id}')" class="text-amber-400 hover:underline text-[11px]">Details</button>
          <button onclick="toggleSlotStatus('${slot.id}', 'available')" class="text-slate-400 hover:text-white text-[11px]">Release</button>
        </div>
      `;
    } else if (slot.status === 'maintenance') {
      statusClass = 'bay-maintenance';
      statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 uppercase tracking-wider">Closed</span>';
      centerContent = `
        <div class="text-center my-2 text-slate-500">
          <i class="fa-solid fa-wrench text-2xl mb-1"></i>
          <p class="text-[11px]">Under Service</p>
        </div>
      `;
      footerContent = `
        <div class="text-center pt-1 border-t border-slate-800">
          <button onclick="toggleSlotStatus('${slot.id}', 'available')" class="text-[11px] text-emerald-400 hover:underline">Reopen Bay</button>
        </div>
      `;
    } else {
      // Available
      if (slot.type === 'EV') {
        statusClass = 'bay-ev';
        statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">EV Ready</span>';
      }
      centerContent = `
        <div class="text-center my-2 group-hover:scale-105 transition-transform cursor-pointer" onclick="openCheckInModal('${slot.id}')">
          <div class="inline-flex items-center justify-center w-10 h-10 rounded-full ${slot.type === 'EV' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'} text-xl mb-1">
            <i class="${slot.type === 'EV' ? 'fa-solid fa-bolt' : icon}"></i>
          </div>
          <p class="text-[11px] font-medium text-emerald-400 group-hover:underline">+ Park Here</p>
        </div>
      `;
      footerContent = `
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span class="text-slate-400 text-[10px]">${slot.type}</span>
          <div class="flex items-center gap-2">
            <button onclick="openReservationModal('${slot.id}')" title="Reserve bay" class="text-amber-400/80 hover:text-amber-300 text-xs"><i class="fa-solid fa-bookmark"></i></button>
            <button onclick="openSlotMenu('${slot.id}')" title="Change status" class="text-slate-500 hover:text-slate-300 text-xs"><i class="fa-solid fa-ellipsis-vertical"></i></button>
          </div>
        </div>
      `;
    }

    return `
      <div class="parking-bay ${statusClass} group cursor-pointer" onclick="${slot.status === 'occupied' && ticket ? `openCheckOutModal('${ticket.id}')` : slot.status === 'available' ? `openCheckInModal('${slot.id}')` : ''}">
        <div class="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <span class="font-mono font-extrabold text-sm text-slate-100 flex items-center gap-1">
            ${slot.id}
            ${slot.type === 'EV' ? '<i class="fa-solid fa-bolt text-[10px] text-cyan-400"></i>' : ''}
          </span>
          ${statusBadge}
        </div>
        ${centerContent}
        ${footerContent}
      </div>
    `;
  }).join('');
}

// Render Active Parked Vehicles Table
function renderActiveVehiclesTable() {
  const tbody = document.getElementById('activeVehiclesTableBody');
  if (!tbody) return;

  let tickets = [...appState.activeTickets];

  if (appState.searchQuery) {
    tickets = tickets.filter(t =>
      t.plateNumber.toLowerCase().includes(appState.searchQuery) ||
      t.slotId.toLowerCase().includes(appState.searchQuery) ||
      (t.driverName && t.driverName.toLowerCase().includes(appState.searchQuery))
    );
  }

  const badgeCount = document.getElementById('activeVehiclesBadgeCount');
  if (badgeCount) badgeCount.textContent = `${tickets.length} Active`;

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 text-sm">
          No active vehicles found matching query.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tickets.map(t => {
    const elapsed = formatDuration(t.entryTime);
    const isOverstay = isVehicleOverstay(t.entryTime);
    const entryDate = new Date(t.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const estFee = calculateLiveEstimatedFee(t);

    return `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 font-mono font-medium text-blue-400">
          <button onclick="showTicketReceipt('${t.id}')" class="hover:underline flex items-center gap-1.5">
            <i class="fa-solid fa-ticket text-xs text-slate-400"></i>
            ${t.id}
          </button>
        </td>
        <td class="py-3 px-4">
          <div class="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded inline-flex items-center gap-1.5 border border-slate-700 text-xs">
            ${t.plateNumber}
            ${isOverstay ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-overstay" title="Parked > 3 hours"></span>' : ''}
          </div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
            <i class="${getVehicleIcon(t.vehicleType)} text-blue-400"></i>
            ${t.vehicleType}
          </span>
        </td>
        <td class="py-3 px-4 font-mono font-semibold text-white">
          <span class="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs">${t.slotId}</span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          <div>${entryDate}</div>
          <div class="text-[11px] ${isOverstay ? 'text-amber-400 font-bold' : 'text-slate-400'}"><i class="fa-regular fa-clock mr-1"></i>${elapsed}</div>
        </td>
        <td class="py-3 px-4 font-mono font-bold text-emerald-400 text-xs">
          $${estFee}
        </td>
        <td class="py-3 px-4 text-right">
          <div class="inline-flex items-center gap-2">
            <button onclick="showTicketReceipt('${t.id}')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition" title="Print Entry Ticket">
              <i class="fa-solid fa-print"></i>
            </button>
            <button onclick="openCheckOutModal('${t.id}')" class="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium rounded shadow transition" title="Process Check-Out">
              Check-Out
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render History Table
function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  let history = [...appState.historyTickets];

  if (appState.searchQuery) {
    history = history.filter(h =>
      h.plateNumber.toLowerCase().includes(appState.searchQuery) ||
      h.slotId.toLowerCase().includes(appState.searchQuery) ||
      h.id.toLowerCase().includes(appState.searchQuery)
    );
  }

  const historyCount = document.getElementById('historyBadgeCount');
  if (historyCount) historyCount.textContent = `${history.length} Sessions`;

  if (history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 text-sm">
          No checkout transactions on record.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history.slice(0, 15).map(h => {
    const entryFormatted = new Date(h.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const exitFormatted = new Date(h.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <tr class="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
        <td class="py-3 px-4 font-mono font-medium text-slate-300 text-xs">
          ${h.id}
        </td>
        <td class="py-3 px-4 font-mono font-bold text-white text-xs">
          ${h.plateNumber}
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          ${h.slotId} (${h.vehicleType})
        </td>
        <td class="py-3 px-4 text-xs text-slate-400">
          ${entryFormatted} ➔ ${exitFormatted}
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          ${h.durationHours}h (${h.durationMinutes || (h.durationHours * 60)}m)
        </td>
        <td class="py-3 px-4 font-mono font-bold text-emerald-400 text-xs">
          $${(h.totalAmount || 0).toFixed(2)}
          <span class="text-[10px] text-slate-400 font-normal ml-1">(${h.paymentMethod})</span>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="showCompletedReceipt('${h.id}')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded border border-slate-700 transition">
            <i class="fa-solid fa-receipt mr-1"></i> Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Charts via Chart.js
function renderCharts() {
  if (typeof Chart === 'undefined' || !appState.stats) return;

  const stats = appState.stats;

  // 1. Floor Occupancy Bar Chart
  const floorCtx = document.getElementById('floorOccupancyChart')?.getContext('2d');
  if (floorCtx) {
    const floorLabels = ['Floor 1 (Ground & EV)', 'Floor 2 (SUVs & VIP)', 'Floor 3 (Standard & Bikes)'];
    const occupiedData = [stats.floorStats[1]?.occupied || 0, stats.floorStats[2]?.occupied || 0, stats.floorStats[3]?.occupied || 0];
    const availableData = [stats.floorStats[1]?.available || 0, stats.floorStats[2]?.available || 0, stats.floorStats[3]?.available || 0];

    if (floorChart) {
      floorChart.data.datasets[0].data = occupiedData;
      floorChart.data.datasets[1].data = availableData;
      floorChart.update();
    } else {
      floorChart = new Chart(floorCtx, {
        type: 'bar',
        data: {
          labels: floorLabels,
          datasets: [
            {
              label: 'Occupied Bays',
              data: occupiedData,
              backgroundColor: 'rgba(239, 68, 68, 0.75)',
              borderRadius: 6
            },
            {
              label: 'Available Bays',
              data: availableData,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8', precision: 0 }, grid: { color: 'rgba(51, 65, 85, 0.3)' } }
          }
        }
      });
    }
  }

  // 2. Vehicle Category Distribution Doughnut Chart
  const catCtx = document.getElementById('vehicleCategoryChart')?.getContext('2d');
  if (catCtx) {
    const counts = stats.vehicleTypeCounts || {};
    const labels = Object.keys(counts);
    const dataVals = Object.values(counts);

    if (categoryChart) {
      categoryChart.data.labels = labels;
      categoryChart.data.datasets[0].data = dataVals;
      categoryChart.update();
    } else {
      categoryChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['No Vehicles'],
          datasets: [{
            data: dataVals.length ? dataVals : [1],
            backgroundColor: [
              '#3b82f6', // Sedan
              '#06b6d4', // EV
              '#f59e0b', // SUV
              '#10b981', // Motorcycle
              '#8b5cf6'  // Truck
            ],
            borderWidth: 2,
            borderColor: '#0f172a'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 } } }
          },
          cutout: '68%'
        }
      });
    }
  }
}

// Populate preferred slots in Check-In modal
function populateAvailableSlotsSelect() {
  const select = document.getElementById('checkinSlotSelect');
  if (!select) return;

  const currentVal = select.value;
  const availableSlots = appState.slots.filter(s => s.status === 'available');

  select.innerHTML = '<option value="">-- Auto-Assign Best Available Bay --</option>';
  availableSlots.forEach(s => {
    select.innerHTML += `<option value="${s.id}">Slot ${s.id} (Floor ${s.floor} - ${s.type})</option>`;
  });

  if (currentVal) select.value = currentVal;
}

// Open Check-In Modal
function openCheckInModal(preselectedSlotId = '') {
  const modal = document.getElementById('checkInModal');
  if (!modal) return;

  document.getElementById('checkInForm')?.reset();
  populateAvailableSlotsSelect();

  if (preselectedSlotId) {
    const slotSelect = document.getElementById('checkinSlotSelect');
    if (slotSelect) slotSelect.value = preselectedSlotId;

    const slotObj = appState.slots.find(s => s.id === preselectedSlotId);
    if (slotObj) {
      const typeSelect = document.getElementById('checkinVehicleType');
      if (typeSelect && ['Sedan', 'SUV', 'EV', 'Motorcycle', 'Truck'].includes(slotObj.type)) {
        typeSelect.value = slotObj.type;
      }
    }
  }

  updateCheckinRateEstimate();
  modal.classList.remove('hidden');
  document.getElementById('checkinPlateNumber')?.focus();
}

function updateCheckinRateEstimate() {
  const typeSelect = document.getElementById('checkinVehicleType');
  const rateDisplay = document.getElementById('checkinEstimatedRateDisplay');
  if (!typeSelect || !rateDisplay) return;

  const type = typeSelect.value;
  const rate = appState.tariffs[type] || 3.0;
  rateDisplay.textContent = `$${rate.toFixed(2)} / hour`;
}

// Handle Check-In Form Submit
async function handleCheckInSubmit(e) {
  e.preventDefault();
  const plateNumber = document.getElementById('checkinPlateNumber').value.trim();
  const vehicleType = document.getElementById('checkinVehicleType').value;
  const driverName = document.getElementById('checkinDriverName').value.trim();
  const driverPhone = document.getElementById('checkinDriverPhone').value.trim();
  const preferredSlot = document.getElementById('checkinSlotSelect').value;

  if (!plateNumber) {
    showToast('Please enter a vehicle license plate number', 'warning');
    return;
  }

  try {
    const res = await api.checkIn({
      plateNumber,
      vehicleType,
      driverName,
      driverPhone,
      preferredSlot
    });

    playChime('checkin');
    showToast(`Vehicle ${plateNumber} parked in Slot ${res.data.slot.id}`, 'success');
    document.getElementById('checkInModal').classList.add('hidden');

    await loadAllData();
    showTicketReceipt(res.data.ticket.id);
  } catch (err) {
    playChime('alert');
    showToast(err.message, 'error');
  }
}

// Open Check-Out Modal
function openCheckOutModal(prefillQuery = '') {
  const modal = document.getElementById('checkOutModal');
  if (!modal) return;

  modal.classList.remove('hidden');
  const queryInput = document.getElementById('checkoutQueryInput');
  if (queryInput) {
    queryInput.value = prefillQuery || '';
    if (prefillQuery) {
      handleCheckoutQueryChange();
    } else {
      resetCheckoutModalPreview();
      queryInput.focus();
    }
  }
}

function resetCheckoutModalPreview() {
  const previewBox = document.getElementById('checkoutPreviewBox');
  const emptyPrompt = document.getElementById('checkoutEmptyPrompt');
  const btn = document.getElementById('btnConfirmCheckout');

  if (previewBox) previewBox.classList.add('hidden');
  if (emptyPrompt) emptyPrompt.classList.remove('hidden');
  if (btn) btn.disabled = true;
}

// Handle Check-Out Query change
async function handleCheckoutQueryChange() {
  const query = document.getElementById('checkoutQueryInput').value.trim();
  const discount = parseFloat(document.getElementById('checkoutDiscountInput').value) || 0;

  if (!query) {
    resetCheckoutModalPreview();
    return;
  }

  try {
    const res = await api.previewBill(query, discount);
    const data = res.data;

    const previewBox = document.getElementById('checkoutPreviewBox');
    const emptyPrompt = document.getElementById('checkoutEmptyPrompt');
    const btn = document.getElementById('btnConfirmCheckout');

    if (emptyPrompt) emptyPrompt.classList.add('hidden');
    if (previewBox) previewBox.classList.remove('hidden');
    if (btn) btn.disabled = false;

    // Fill data
    document.getElementById('billTicketId').textContent = data.ticket.id;
    document.getElementById('billPlateNumber').textContent = data.ticket.plateNumber;
    document.getElementById('billSlotId').textContent = data.ticket.slotId;
    document.getElementById('billVehicleType').textContent = data.ticket.vehicleType;
    document.getElementById('billEntryTime').textContent = new Date(data.ticket.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('billDuration').textContent = `${data.durationHours} hr (${data.durationMinutes} mins)`;
    document.getElementById('billRate').textContent = `$${data.ratePerHour.toFixed(2)}/hr`;
    document.getElementById('billSubtotal').textContent = `$${data.subtotal.toFixed(2)}`;
    document.getElementById('billDiscount').textContent = `-$${data.discount.toFixed(2)}`;
    document.getElementById('billTax').textContent = `+$${data.tax.toFixed(2)}`;
    document.getElementById('billTotalAmount').textContent = `$${data.totalAmount.toFixed(2)}`;
  } catch (err) {
    resetCheckoutModalPreview();
    const prompt = document.getElementById('checkoutEmptyPrompt');
    if (prompt) {
      prompt.innerHTML = `<span class="text-rose-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${err.message}</span>`;
      prompt.classList.remove('hidden');
    }
  }
}

// Confirm Check-Out
async function handleConfirmCheckout() {
  const query = document.getElementById('checkoutQueryInput').value.trim();
  const paymentMethod = document.getElementById('checkoutPaymentMethod').value;
  const discountPercent = parseFloat(document.getElementById('checkoutDiscountInput').value) || 0;

  if (!query) {
    showToast('Please enter Ticket ID or Plate Number', 'warning');
    return;
  }

  try {
    const res = await api.checkOut(query, paymentMethod, discountPercent);
    playChime('checkout');
    showToast(`Payment of $${res.data.receipt.totalAmount.toFixed(2)} received. Slot ${res.data.slot.id} released!`, 'success');
    document.getElementById('checkOutModal').classList.add('hidden');

    await loadAllData();
    showCompletedReceipt(res.data.receipt.id);
  } catch (err) {
    playChime('alert');
    showToast(err.message, 'error');
  }
}

// Render dynamic QR code into an element
function renderQRCodeInto(elementId, text) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: text,
      width: 80,
      height: 80,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

// Show Entry Parking Ticket Modal (Thermal Pass with QR)
function showTicketReceipt(ticketId) {
  let ticket = appState.activeTickets.find(t => t.id === ticketId);
  if (!ticket) {
    ticket = appState.historyTickets.find(t => t.id === ticketId);
  }
  if (!ticket) {
    showToast(`Ticket ${ticketId} not found`, 'error');
    return;
  }

  const modal = document.getElementById('thermalTicketModal');
  if (!modal) return;

  document.getElementById('ticketPassId').textContent = ticket.id;
  document.getElementById('ticketPassBarcodeId').textContent = ticket.id;
  document.getElementById('ticketPassPlate').textContent = ticket.plateNumber;
  document.getElementById('ticketPassSlot').textContent = ticket.slotId;
  document.getElementById('ticketPassType').textContent = ticket.vehicleType;
  document.getElementById('ticketPassDriver').textContent = ticket.driverName || 'Standard Guest';
  document.getElementById('ticketPassEntryTime').textContent = new Date(ticket.entryTime).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  document.getElementById('ticketPassRate').textContent = `$${(ticket.ratePerHour || 3.0).toFixed(2)} / hr`;

  // Render Scannable QR Code
  renderQRCodeInto('ticketPassQrContainer', `PARKFLOW:${ticket.id}:${ticket.plateNumber}:${ticket.slotId}`);

  modal.classList.remove('hidden');
}

// Show Completed Checkout Tax Receipt Modal (Thermal Tax Invoice with QR)
function showCompletedReceipt(receiptId) {
  const receipt = appState.historyTickets.find(t => t.id === receiptId);
  if (!receipt) {
    showToast(`Receipt ${receiptId} not found`, 'error');
    return;
  }

  const modal = document.getElementById('thermalReceiptModal');
  if (!modal) return;

  document.getElementById('rcptId').textContent = receipt.id;
  document.getElementById('rcptPlate').textContent = receipt.plateNumber;
  document.getElementById('rcptSlot').textContent = receipt.slotId;
  document.getElementById('rcptType').textContent = receipt.vehicleType;
  document.getElementById('rcptEntry').textContent = new Date(receipt.entryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  document.getElementById('rcptExit').textContent = new Date(receipt.exitTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  document.getElementById('rcptDuration').textContent = `${receipt.durationHours} Hours (${receipt.durationMinutes || (receipt.durationHours * 60)} mins)`;
  document.getElementById('rcptSubtotal').textContent = `$${receipt.subtotal.toFixed(2)}`;
  document.getElementById('rcptDiscount').textContent = `-$${receipt.discount.toFixed(2)}`;
  document.getElementById('rcptTax').textContent = `+$${receipt.tax.toFixed(2)}`;
  document.getElementById('rcptTotal').textContent = `$${receipt.totalAmount.toFixed(2)}`;
  document.getElementById('rcptPaymentMethod').textContent = receipt.paymentMethod;

  // Render Scannable QR Code
  renderQRCodeInto('rcptQrContainer', `PAID:${receipt.id}:${receipt.totalAmount}:${receipt.plateNumber}`);

  modal.classList.remove('hidden');
}

// Reservation Modal Management
function openReservationModal(slotId) {
  const modal = document.getElementById('reservationModal');
  if (!modal) return;

  const slot = appState.slots.find(s => s.id === slotId);
  if (!slot) return;

  document.getElementById('reserveSlotIdDisplay').textContent = slot.id;
  document.getElementById('reserveSlotFloorDisplay').textContent = `Floor ${slot.floor} (${slot.type})`;
  document.getElementById('reserveSlotIdInput').value = slot.id;

  const cancelBtn = document.getElementById('btnCancelReservation');
  const submitBtn = document.getElementById('btnSubmitReservation');

  if (slot.status === 'reserved' && slot.reservation) {
    document.getElementById('reserveCustomerName').value = slot.reservation.customerName || '';
    document.getElementById('reserveCustomerPhone').value = slot.reservation.customerPhone || '';
    document.getElementById('reserveNotes').value = slot.reservation.notes || '';
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    if (submitBtn) submitBtn.textContent = 'Update Reservation';
  } else {
    document.getElementById('reservationForm')?.reset();
    document.getElementById('reserveSlotIdInput').value = slot.id;
    if (cancelBtn) cancelBtn.classList.add('hidden');
    if (submitBtn) submitBtn.textContent = 'Confirm Reservation';
  }

  modal.classList.remove('hidden');
}

async function handleReservationSubmit(e) {
  e.preventDefault();
  const slotId = document.getElementById('reserveSlotIdInput').value;
  const customerName = document.getElementById('reserveCustomerName').value.trim();
  const customerPhone = document.getElementById('reserveCustomerPhone').value.trim();
  const notes = document.getElementById('reserveNotes').value.trim();

  if (!customerName) {
    showToast('Customer name is required', 'warning');
    return;
  }

  try {
    await api.reserveSlot(slotId, { customerName, customerPhone, notes });
    playChime('checkin');
    showToast(`Bay ${slotId} reserved for ${customerName}`, 'success');
    document.getElementById('reservationModal').classList.add('hidden');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCancelReservation() {
  const slotId = document.getElementById('reserveSlotIdInput').value;
  if (!confirm(`Cancel reservation for Bay ${slotId}?`)) return;

  try {
    await api.cancelReservation(slotId);
    showToast(`Reservation for Bay ${slotId} cancelled`, 'info');
    document.getElementById('reservationModal').classList.add('hidden');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Export CSV handler
function handleExportCSV() {
  const url = api.getExportCSVUrl();
  window.open(url, '_blank');
  showToast('Downloading transactions CSV report...', 'info');
}

// Open Tariffs Modal
function openTariffsModal() {
  const modal = document.getElementById('tariffsModal');
  if (!modal) return;

  const tariffs = appState.tariffs;
  document.getElementById('tariffSedan').value = tariffs.Sedan || 3.0;
  document.getElementById('tariffSUV').value = tariffs.SUV || 4.5;
  document.getElementById('tariffEV').value = tariffs.EV || 4.0;
  document.getElementById('tariffMotorcycle').value = tariffs.Motorcycle || 1.5;
  document.getElementById('tariffTruck').value = tariffs.Truck || 7.0;

  modal.classList.remove('hidden');
}

// Handle Tariffs Form Submit
async function handleTariffsSubmit(e) {
  e.preventDefault();
  const newTariffs = {
    Sedan: parseFloat(document.getElementById('tariffSedan').value),
    SUV: parseFloat(document.getElementById('tariffSUV').value),
    EV: parseFloat(document.getElementById('tariffEV').value),
    Motorcycle: parseFloat(document.getElementById('tariffMotorcycle').value),
    Truck: parseFloat(document.getElementById('tariffTruck').value)
  };

  try {
    await api.updateTariffs(newTariffs);
    showToast('Tariff rates updated successfully', 'success');
    document.getElementById('tariffsModal').classList.add('hidden');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Toggle slot status
async function toggleSlotStatus(slotId, newStatus) {
  try {
    await api.updateSlotStatus(slotId, newStatus);
    showToast(`Slot ${slotId} updated to ${newStatus}`, 'info');
    await loadAllData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openSlotMenu(slotId) {
  const slot = appState.slots.find(s => s.id === slotId);
  if (!slot) return;

  const action = confirm(`Change status for Slot ${slotId}?\nClick OK to toggle between Available and Maintenance.`);
  if (action) {
    const nextStatus = slot.status === 'available' ? 'maintenance' : 'available';
    toggleSlotStatus(slotId, nextStatus);
  }
}

function resetFilters() {
  appState.statusFilter = 'all';
  appState.searchQuery = '';
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.filter-tab').forEach(b => {
    b.classList.remove('bg-slate-700', 'text-white', 'border-slate-500');
    b.classList.add('text-slate-400', 'border-transparent');
  });
  const allTab = document.querySelector('.filter-tab[data-status="all"]');
  if (allTab) {
    allTab.classList.add('bg-slate-700', 'text-white', 'border-slate-500');
    allTab.classList.remove('text-slate-400', 'border-transparent');
  }

  renderParkingGrid();
}

// Helpers
function formatDuration(startTimeIso) {
  const start = new Date(startTimeIso);
  const now = new Date();
  const diffMins = Math.max(0, Math.floor((now - start) / (1000 * 60)));

  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function isVehicleOverstay(startTimeIso) {
  const start = new Date(startTimeIso);
  const diffHours = (new Date() - start) / (1000 * 60 * 60);
  return diffHours >= 3.0;
}

function calculateLiveEstimatedFee(ticket) {
  const start = new Date(ticket.entryTime);
  const diffMins = Math.max(1, Math.ceil((new Date() - start) / (1000 * 60)));
  const billedHours = Math.max(1, Math.ceil(diffMins / 60));
  const rate = ticket.ratePerHour || 3.0;
  return (billedHours * rate * 1.08).toFixed(2);
}

function getVehicleIcon(type) {
  switch (type?.toLowerCase()) {
    case 'motorcycle':
    case 'bike':
      return 'fa-solid fa-motorcycle';
    case 'suv':
      return 'fa-solid fa-truck-pickup';
    case 'ev':
      return 'fa-solid fa-charging-station';
    case 'truck':
      return 'fa-solid fa-truck';
    case 'sedan':
    default:
      return 'fa-solid fa-car';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600/95 text-white border-emerald-500',
    error: 'bg-rose-600/95 text-white border-rose-500',
    warning: 'bg-amber-600/95 text-white border-amber-500',
    info: 'bg-slate-800/95 text-blue-300 border-slate-700'
  };

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} text-base"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
