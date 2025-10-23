const mongoose = require('mongoose');

// Payment history sub-schema
const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentType: {
    type: String,
    required: true,
    trim: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const invoiceSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    unique: true
    // Will be auto-generated in the route handler, so not marked as required
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  itemDescription: {
    type: String,
    required: true,
    trim: true
  },
  invoiceNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  invoiceAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CNY', 'JPY', 'AUD', 'CAD', 'CHF', 'AED'],
    default: 'USD',
    trim: true
  },
  invoiceType: {
    type: String,
    required: true,
    enum: ['Service', 'Product', 'License'],
    trim: true
  },
  transferAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  bankRefNumber: {
    type: String,
    trim: true
  },
  bankTransferDate: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Paid', 'Pending', 'Partial', 'Unpaid'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    trim: true
  },
  payments: [paymentSchema]
}, {
  timestamps: true
});

// Pre-save middleware to calculate transfer amount from payments
invoiceSchema.pre('save', function(next) {
  if (this.payments && this.payments.length > 0) {
    this.transferAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update status based on payment
    if (this.transferAmount >= this.invoiceAmount) {
      this.status = 'Paid';
    } else if (this.transferAmount > 0) {
      this.status = 'Partial';
    } else {
      this.status = 'Unpaid';
    }
  }
  next();
});

// Index for faster queries
invoiceSchema.index({ clientName: 1 });
invoiceSchema.index({ status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
