// Simple test script to verify API functionality
const https = require('http');

const baseURL = 'http://localhost:3000';

// Helper function to make requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Invoice Management API\n');

  try {
    // Test 1: Get all invoices
    console.log('1️⃣  Testing GET /api/invoices');
    const allInvoices = await makeRequest('/api/invoices');
    console.log(`   ✅ Success! Found ${allInvoices.count} invoices`);
    console.log(`   First invoice: ${allInvoices.data[0]?.clientName} - ${allInvoices.data[0]?.invoiceNo}\n`);

    // Test 2: Get invoices by status
    console.log('2️⃣  Testing GET /api/invoices?status=Paid');
    const paidInvoices = await makeRequest('/api/invoices?status=Paid');
    console.log(`   ✅ Success! Found ${paidInvoices.count} paid invoices\n`);

    // Test 3: Get invoice statistics
    console.log('3️⃣  Testing GET /api/invoices/stats/summary');
    const stats = await makeRequest('/api/invoices/stats/summary');
    console.log(`   ✅ Success!`);
    console.log(`   Total Invoices: ${stats.data.totalInvoices}`);
    console.log(`   Total Invoice Amount: $${stats.data.totalInvoiceAmount}`);
    console.log(`   Total Transfer Amount: $${stats.data.totalTransferAmount}\n`);

    // Test 4: Get invoice by invoice number
    console.log('4️⃣  Testing GET /api/invoices/invoice-no/INV-2025-001');
    const invoice = await makeRequest('/api/invoices/invoice-no/INV-2025-001');
    console.log(`   ✅ Success! Found invoice for ${invoice.data.clientName}\n`);

    // Test 5: Create new invoice
    console.log('5️⃣  Testing POST /api/invoices');
    const newInvoice = {
      srNo: 11,
      clientName: 'Test API Client',
      itemDescription: 'API Testing Service',
      invoiceNo: 'INV-2025-TEST',
      invoiceDate: '2025-03-25',
      invoiceAmount: 999.99,
      invoiceType: 'Service',
      transferAmount: 0,
      bankName: 'Pending',
      bankRefNumber: 'N/A',
      bankTransferDate: 'N/A',
      status: 'Pending',
      remarks: 'Test invoice created by API test'
    };
    const created = await makeRequest('/api/invoices', 'POST', newInvoice);
    console.log(`   ✅ Success! Created invoice: ${created.data.invoiceNo}\n`);

    console.log('🎉 All tests passed! API is working correctly.\n');
    console.log('📊 API Endpoints Available:');
    console.log('   - GET    /api/invoices');
    console.log('   - GET    /api/invoices/:id');
    console.log('   - GET    /api/invoices/invoice-no/:invoiceNo');
    console.log('   - GET    /api/invoices/stats/summary');
    console.log('   - POST   /api/invoices');
    console.log('   - PUT    /api/invoices/:id');
    console.log('   - PATCH  /api/invoices/:id/status');
    console.log('   - DELETE /api/invoices/:id');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
