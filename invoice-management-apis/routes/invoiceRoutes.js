const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const SerialNumber = require('../models/SerialNumber');

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, clientName, invoiceType, fromDate, toDate } = req.query;
    
    let filter = {};
    
    // Add filters if provided
    if (status) filter.status = status;
    if (clientName) filter.clientName = new RegExp(clientName, 'i');
    if (invoiceType) filter.invoiceType = invoiceType;
    if (fromDate || toDate) {
      filter.invoiceDate = {};
      if (fromDate) filter.invoiceDate.$gte = new Date(fromDate);
      if (toDate) filter.invoiceDate.$lte = new Date(toDate);
    }

    const invoices = await Invoice.find(filter).sort({ srNo: 1 });
    
    // Recalculate transfer amounts from payments for each invoice
    const invoicesWithCalculatedAmounts = invoices.map(invoice => {
      const invoiceObj = invoice.toObject();
      if (invoiceObj.payments && invoiceObj.payments.length > 0) {
        invoiceObj.transferAmount = invoiceObj.payments.reduce((sum, payment) => sum + payment.amount, 0);
      }
      return invoiceObj;
    });
    
    res.json({
      success: true,
      count: invoices.length,
      data: invoicesWithCalculatedAmounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/invoices/invoice-no/:invoiceNo
// @desc    Get single invoice by invoice number
// @access  Public
router.get('/invoice-no/:invoiceNo', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/invoices/:id/payments
// @desc    Add payment to invoice
// @access  Public
router.post('/:id/payments', async (req, res) => {
  try {
    const { amount, paymentType, remarks } = req.body;
    
    if (!amount || !paymentType) {
      return res.status(400).json({
        success: false,
        message: 'Amount and payment type are required'
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Add payment to payments array
    invoice.payments.push({
      amount: parseFloat(amount),
      paymentType,
      paymentDate: new Date(),
      remarks: remarks || ''
    });

    // Calculate total transfer amount from all payments
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    invoice.transferAmount = totalPaid;

    // Update status based on payment
    if (totalPaid >= invoice.invoiceAmount) {
      invoice.status = 'Paid';
    } else if (totalPaid > 0) {
      invoice.status = 'Partial';
    } else {
      invoice.status = 'Unpaid';
    }

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Payment added successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add payment',
      error: error.message
    });
  }
});

// @route   GET /api/invoices/:id/payments
// @desc    Get all payments for an invoice
// @access  Public
router.get('/:id/payments', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: {
        invoiceNo: invoice.invoiceNo,
        clientName: invoice.clientName,
        invoiceAmount: invoice.invoiceAmount,
        currency: invoice.currency,
        transferAmount: invoice.transferAmount,
        payments: invoice.payments || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   DELETE /api/invoices/:id/payments/:paymentId
// @desc    Delete a payment from invoice
// @access  Public
router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Remove payment from array
    invoice.payments = invoice.payments.filter(
      payment => payment._id.toString() !== req.params.paymentId
    );

    // Recalculate total transfer amount
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    invoice.transferAmount = totalPaid;

    // Update status
    if (totalPaid >= invoice.invoiceAmount) {
      invoice.status = 'Paid';
    } else if (totalPaid > 0) {
      invoice.status = 'Partial';
    } else {
      invoice.status = 'Unpaid';
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Public
router.post('/', async (req, res) => {
  try {
    // Remove srNo from request body if it exists (we'll auto-generate it)
    const { srNo, ...invoiceData } = req.body;
    
    let nextSrNo;
    
    // First, check if there's any available serial number from deleted invoices
    const availableSerialNumber = await SerialNumber.findOne({ available: true }).sort({ number: 1 });
    
    if (availableSerialNumber) {
      // Reuse the lowest available serial number
      nextSrNo = availableSerialNumber.number;
      // Mark it as used by deleting it from the pool
      await SerialNumber.findByIdAndDelete(availableSerialNumber._id);
      console.log(`Reusing serial number: ${nextSrNo}`);
    } else {
      // No available serial numbers, generate next sequential number
      const lastInvoice = await Invoice.findOne().sort({ srNo: -1 });
      nextSrNo = lastInvoice ? lastInvoice.srNo + 1 : 1;
      console.log(`Generating new serial number: ${nextSrNo}`);
    }
    
    // Create invoice with auto-generated srNo
    const invoiceWithSrNo = {
      ...invoiceData,
      srNo: nextSrNo
    };
    
    const invoice = await Invoice.create(invoiceWithSrNo);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    if (error.code === 11000) {
      // Check which field caused the duplicate
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'invoiceNo' ? 'Invoice number' : 'Serial number'} already exists`
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
});

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
});

// @route   PATCH /api/invoices/:id/status
// @desc    Update invoice status
// @access  Public
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Add the deleted invoice's serial number to the pool for reuse
    try {
      await SerialNumber.create({
        number: invoice.srNo,
        available: true,
        deletedAt: new Date()
      });
      console.log(`Serial number ${invoice.srNo} added to reuse pool`);
    } catch (serialError) {
      // If serial number already exists in pool (shouldn't happen), log but don't fail
      console.error('Error adding serial number to pool:', serialError.message);
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/invoices/stats/summary
// @desc    Get invoice statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$invoiceAmount' },
          totalTransferred: { $sum: '$transferAmount' }
        }
      }
    ]);

    const totalInvoices = await Invoice.countDocuments();
    const totalInvoiceAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$invoiceAmount' } } }
    ]);
    const totalTransferAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$transferAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalInvoiceAmount: totalInvoiceAmount[0]?.total || 0,
        totalTransferAmount: totalTransferAmount[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;
