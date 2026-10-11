# 🚗 ParkFlow Pro - Smart Car Parking Management System v1.1.0

A modern, production-ready, full-stack **Car Parking Management System** featuring an interactive 2D parking bay visualizer, automated ticketing with scannable QR codes, Web Audio synthesizer effects, Chart.js business analytics, VIP bay reservations, CSV reporting, and a robust RESTful API backend.

---

## 🌟 Key Features

### 🖥️ Frontend Dashboard
- **Interactive 2D Parking Bay Visualizer**:
  - Multi-level floor navigation (Floor 1: Ground & EV, Floor 2: SUVs & VIP, Floor 3: Standard & Two-Wheelers).
  - Real-time color-coded bays:
    - 🟢 **Available** (Instant 1-click check-in or reserve)
    - 🔴 **Occupied** (Displays license plate, vehicle icon, elapsed duration timer, 1-click checkout)
    - ⚡ **EV Charging Ready** (Dedicated EV ports with charging indicators)
    - 🟡 **VIP Reserved** (Reserved spots for guests with contact details)
    - ⚪ **Maintenance** (Toggle closed/open for maintenance)
  - Driving aisle markings, entrance and exit indicators.
  - **Overstay Alert**: Vehicles parked for > 3 hours display an amber pulse badge.
- **Smart Vehicle Check-In**:
  - License plate entry with automatic format cleanup.
  - Multi-category vehicle selection (Sedan, SUV, EV, Motorcycle, Truck) with live hourly rate preview.
  - Auto-assign nearest available bay or select a preferred bay manually.
  - Driver name and contact phone recording.
- **Automated Check-Out & Billing**:
  - Search by Ticket ID, License Plate, or Bay Number.
  - Live billing preview: computes exact parked duration (hours and minutes), applied hourly tariff, subtotal, optional percentage discount, and 8% sales tax.
  - Multi-payment support: Cash, Credit/Debit Card, UPI / QR, and RFID FastTag.
- **Real Scannable QR Codes & Printable Thermal Receipts**:
  - **Entry Parking Pass**: 80mm POS style with scannable QR code canvas, slot assignment, and timestamp.
  - **Checkout Tax Invoice**: Itemized breakdown with scannable verification QR code, entry/exit timestamps, total duration, tax calculation, and payment method.
  - Seamless `window.print()` styling with clean print layout.
- **Interactive Visual Analytics (Chart.js)**:
  - Floor Bay Utilization Bar Chart (Occupied vs Available bays per floor).
  - Vehicle Category Breakdown Doughnut Chart.
- **Web Audio API Sound Effects**:
  - Synthesized chimes for vehicle entry, checkout payment, and warnings (no external audio files required!).
  - One-click mute/unmute toggle persisted in browser local storage.
- **CSV Data Export**:
  - One-click export of complete parking history to `.csv` spreadsheet.
- **Tariff Rate Manager**:
  - Live adjustment of hourly rates for each vehicle class.
- **Live Search & Filters**:
  - Search across bay IDs, license plate numbers, and driver names in real time.

---

### 📡 Backend REST API
- **Node.js & Express Architecture**:
  - Zero native C++ dependency issues; reliable cross-platform JSON persistence engine.
  - CORS-enabled with formatted request logging.
  - Automated test suite included (`npm test`).
  - Serves API routes and static frontend assets simultaneously on port 5000.
- **Complete Endpoints**:
  - `/api/slots` — List, filter by floor/status, and toggle slot states.
  - `/api/slots/:id/reserve` — Reserve bay for a customer.
  - `/api/slots/:id/cancel-reservation` — Release a reserved bay.
  - `/api/tickets/checkin` — Check in vehicle, assign bay, generate ticket.
  - `/api/tickets/checkout` — Calculate billing, release bay, save transaction.
  - `/api/tickets/preview-bill` — Live price estimation before payment.
  - `/api/tickets/active` — Currently parked vehicles.
  - `/api/tickets/history` — Completed checkout log with financial metrics.
  - `/api/tariffs` — Retrieve and update hourly rates per vehicle type.
  - `/api/stats` — High-level dashboard counters, occupancy rates, and revenue.
  - `/api/analytics` — Business metrics, category distributions, and floor utilization.
  - `/api/analytics/export/csv` — Download transaction history as CSV file.

---

## 📁 Project Structure

```
car-parking-management-system/
├── backend/
│   ├── data/
│   │   └── parking_data.json       # Persistent data store (pre-seeded)
│   ├── db/
│   │   └── database.js             # Atomic JSON database & seed generator
│   ├── routes/
│   │   ├── slots.js                # Slot queries, reservations & status updates
│   │   ├── tickets.js              # Check-in, checkout, bill preview
│   │   ├── tariffs.js              # Tariff rate configuration
│   │   ├── stats.js                # Dashboard statistics & reset
│   │   └── analytics.js            # Analytics metrics & CSV downloads
│   ├── test/
│   │   └── test.js                 # Automated API test suite
│   ├── .env.example                # Configuration template
│   ├── package.json                # Dependencies (express, cors)
│   └── server.js                   # Main application entry point
├── frontend/
│   ├── css/
│   │   └── styles.css              # 2D parking bay, QR box & print stylesheets
│   ├── js/
│   │   ├── api.js                  # Frontend REST API client
│   │   └── app.js                  # State, Web Audio chimes, Chart.js & QR generation
│   └── index.html                  # Full single-page dashboard application
├── start.bat                       # 1-Click launcher for Windows
├── start.ps1                       # PowerShell launcher
└── README.md                       # Documentation
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root.
- It will verify Node.js is installed.
- Install backend dependencies automatically (if not already present).
- Launch the backend server at `http://localhost:5000`.
- Automatically open your default web browser to the dashboard.

---

### Option 2: Manual Start (Any OS: Windows, macOS, Linux)

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd car-parking-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run automated tests (Optional):
   ```bash
   npm test
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your web browser and visit:
   ```
   http://localhost:5000
   ```

---

## 🔌 REST API Documentation

### Slots & Reservations Endpoints
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/slots` | Get all parking slots | Query: `?floor=1`, `?status=available`, `?type=EV` |
| `GET` | `/api/slots/:id` | Get slot by ID (e.g. `A-01`) | — |
| `PUT` | `/api/slots/:id/status` | Update slot status (`available`, `reserved`, `maintenance`) | `{ "status": "maintenance" }` |
| `POST` | `/api/slots/:id/reserve` | Reserve slot for a guest | `{ "customerName": "VIP Guest", "customerPhone": "..." }` |
| `POST` | `/api/slots/:id/cancel-reservation` | Cancel reservation | — |

### Tickets & Billing Endpoints
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/tickets/active` | Get all active parked vehicles | — |
| `GET` | `/api/tickets/history` | Get past completed parking sessions | — |
| `POST` | `/api/tickets/checkin` | Check in a vehicle | `{ "plateNumber": "KA-01-AB-1234", "vehicleType": "Sedan" }` |
| `POST` | `/api/tickets/preview-bill` | Preview parking fee before paying | `{ "query": "KA-01-AB-1234", "discountPercent": 10 }` |
| `POST` | `/api/tickets/checkout` | Finalize checkout & release bay | `{ "query": "TKT-1001", "paymentMethod": "Credit Card" }` |

### Analytics & Reports Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Summary metrics, revenue breakdown, and utilization |
| `GET` | `/api/analytics/export/csv` | Download complete parking transactions as `.csv` |
| `GET` | `/api/tariffs` | Get current hourly rates |
| `PUT` | `/api/tariffs` | Update hourly rates for vehicle categories |

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).
