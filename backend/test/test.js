/**
 * ParkFlow Pro - Automated Test Suite
 */

const http = require('http');
const app = require('../server');

const TEST_PORT = 5099;
let server;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port: TEST_PORT, hostname: 'localhost', ...options }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(body)
            : body;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting ParkFlow Pro Automated Tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  server = app.listen(TEST_PORT);

  try {
    // 1. Health check
    await test('GET /api/health returns online status', async () => {
      const res = await request({ path: '/api/health', method: 'GET' });
      if (res.status !== 200 || res.body.status !== 'online') {
        throw new Error(`Expected 200 online, got ${res.status}`);
      }
    });

    // 2. Slots count
    await test('GET /api/slots returns 48 slots', async () => {
      const res = await request({ path: '/api/slots', method: 'GET' });
      if (res.status !== 200 || res.body.count !== 48) {
        throw new Error(`Expected 48 slots, got ${res.body.count}`);
      }
    });

    // 3. Check-In test
    let testPlate = 'TEST-999';
    let createdTicketId = '';
    await test('POST /api/tickets/checkin parks a vehicle and assigns bay', async () => {
      const res = await request({
        path: '/api/tickets/checkin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        plateNumber: testPlate,
        vehicleType: 'Sedan',
        driverName: 'Test Driver'
      });

      if (res.status !== 201 || !res.body.success) {
        throw new Error(`Check-in failed: ${JSON.stringify(res.body)}`);
      }
      createdTicketId = res.body.data.ticket.id;
    });

    // 4. Preview Bill test
    await test('POST /api/tickets/preview-bill returns calculated tariff', async () => {
      const res = await request({
        path: '/api/tickets/preview-bill',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        query: testPlate,
        discountPercent: 10
      });

      if (res.status !== 200 || !res.body.success || !res.body.data.totalAmount) {
        throw new Error(`Bill preview failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 5. Check-Out test
    await test('POST /api/tickets/checkout releases slot and creates receipt', async () => {
      const res = await request({
        path: '/api/tickets/checkout',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        query: createdTicketId,
        paymentMethod: 'Credit Card',
        discountPercent: 10
      });

      if (res.status !== 200 || !res.body.success || res.body.data.receipt.status !== 'completed') {
        throw new Error(`Checkout failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 6. Reservation test
    await test('POST /api/slots/:id/reserve reserves bay and updates status', async () => {
      const res = await request({
        path: '/api/slots/VIP-02/reserve',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        customerName: 'VIP Diplomat',
        customerPhone: '+1 555 123 4567'
      });

      if (res.status !== 200 || res.body.data.status !== 'reserved') {
        throw new Error(`Reservation failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 7. Cancel Reservation test
    await test('POST /api/slots/:id/cancel-reservation frees the bay', async () => {
      const res = await request({
        path: '/api/slots/VIP-02/cancel-reservation',
        method: 'POST'
      });

      if (res.status !== 200 || res.body.data.status !== 'available') {
        throw new Error(`Cancel reservation failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 8. Analytics test
    await test('GET /api/analytics returns business metrics and breakdowns', async () => {
      const res = await request({ path: '/api/analytics', method: 'GET' });
      if (res.status !== 200 || !res.body.success || !res.body.data.paymentBreakdown) {
        throw new Error(`Analytics failed: ${JSON.stringify(res.body)}`);
      }
    });

    // 9. CSV export test
    await test('GET /api/analytics/export/csv returns CSV text', async () => {
      const res = await request({ path: '/api/analytics/export/csv', method: 'GET' });
      if (res.status !== 200 || !res.body.includes('Ticket ID,License Plate')) {
        throw new Error(`CSV export failed: ${res.body.slice(0, 100)}`);
      }
    });

    // 10. Tariffs test
    await test('GET /api/tariffs and PUT /api/tariffs update rates properly', async () => {
      const getRes = await request({ path: '/api/tariffs', method: 'GET' });
      if (getRes.status !== 200) throw new Error('Tariffs GET failed');

      const putRes = await request({
        path: '/api/tariffs',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, { Sedan: 3.5 });

      if (putRes.status !== 200 || putRes.body.data.Sedan !== 3.5) {
        throw new Error('Tariffs PUT failed');
      }

      // Revert back
      await request({
        path: '/api/tariffs',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, { Sedan: 3.0 });
    });

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
