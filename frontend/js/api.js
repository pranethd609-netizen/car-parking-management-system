/**
 * ParkFlow Pro - Backend API Client (Vercel & Render Ready)
 */

// Dynamically routes to Render backend when hosted on Vercel or external host
const RENDER_BACKEND_URL = 'https://car-parking-management-backend.onrender.com/api';

const API_BASE = window.PARKFLOW_API_URL || 
  (window.location.hostname.includes('vercel.app')
    ? RENDER_BACKEND_URL
    : (window.location.protocol.startsWith('http') ? `${window.location.origin}/api` : 'http://localhost:5000/api'));

const api = {
  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
      }
      return json;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Stats & Analytics
  async getStats() {
    return this.request('/stats');
  },

  async getAnalytics() {
    return this.request('/analytics');
  },

  getExportCSVUrl() {
    return `${API_BASE}/analytics/export/csv`;
  },

  // Slots
  async getSlots(filters = {}) {
    const params = new URLSearchParams();
    if (filters.floor) params.append('floor', filters.floor);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/slots${query}`);
  },

  async getSlot(id) {
    return this.request(`/slots/${encodeURIComponent(id)}`);
  },

  async updateSlotStatus(id, status) {
    return this.request(`/slots/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async reserveSlot(id, reservationData) {
    return this.request(`/slots/${encodeURIComponent(id)}/reserve`, {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  },

  async cancelReservation(id) {
    return this.request(`/slots/${encodeURIComponent(id)}/cancel-reservation`, {
      method: 'POST'
    });
  },

  // Tickets & Billing
  async getActiveTickets() {
    return this.request('/tickets/active');
  },

  async getHistoryTickets() {
    return this.request('/tickets/history');
  },

  async getTicket(id) {
    return this.request(`/tickets/${encodeURIComponent(id)}`);
  },

  async checkIn(vehicleData) {
    return this.request('/tickets/checkin', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  async previewBill(query, discountPercent = 0) {
    return this.request('/tickets/preview-bill', {
      method: 'POST',
      body: JSON.stringify({ query, discountPercent })
    });
  },

  async checkOut(query, paymentMethod = 'Cash', discountPercent = 0) {
    return this.request('/tickets/checkout', {
      method: 'POST',
      body: JSON.stringify({ query, paymentMethod, discountPercent })
    });
  },

  // Tariffs
  async getTariffs() {
    return this.request('/tariffs');
  },

  async updateTariffs(tariffs) {
    return this.request('/tariffs', {
      method: 'PUT',
      body: JSON.stringify(tariffs)
    });
  },

  // Reset
  async resetDatabase() {
    return this.request('/stats/reset', {
      method: 'POST'
    });
  }
};
