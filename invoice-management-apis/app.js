const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/invoices', invoiceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Invoice Management API',
    version: '1.0.0',
    endpoints: {
      getAllInvoices: 'GET /api/invoices',
      getInvoiceById: 'GET /api/invoices/:id',
      getInvoiceByNumber: 'GET /api/invoices/invoice-no/:invoiceNo',
      createInvoice: 'POST /api/invoices',
      updateInvoice: 'PUT /api/invoices/:id',
      updateStatus: 'PATCH /api/invoices/:id/status',
      deleteInvoice: 'DELETE /api/invoices/:id',
      getStats: 'GET /api/invoices/stats/summary'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
  console.log(`Invoice API: http://localhost:${PORT}/api/invoices`);
});

module.exports = app;
