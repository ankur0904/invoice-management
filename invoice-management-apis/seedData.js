const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const connectDB = require('./config/database');

const sampleInvoices = [
  { srNo: 1, clientName: 'ABC Corporation', itemDescription: 'Consulting Services', invoiceNo: 'INV-2025-001', invoiceDate: '2025-01-15', invoiceAmount: 5000.00, invoiceType: 'Service', transferAmount: 5000.00, bankName: 'State Bank', bankRefNumber: 'SB123456', bankTransferDate: '2025-01-20', status: 'Paid', remarks: 'On time payment' },
  { srNo: 2, clientName: 'XYZ Ltd', itemDescription: 'Software License', invoiceNo: 'INV-2025-002', invoiceDate: '2025-01-20', invoiceAmount: 2500.00, invoiceType: 'License', transferAmount: 2500.00, bankName: 'ICICI Bank', bankRefNumber: 'ICICI789012', bankTransferDate: '2025-01-25', status: 'Pending', remarks: 'Awaiting approval' },
  { srNo: 3, clientName: 'Tech Solutions Inc', itemDescription: 'Hardware Supply', invoiceNo: 'INV-2025-003', invoiceDate: '2025-02-01', invoiceAmount: 15000.00, invoiceType: 'Product', transferAmount: 15000.00, bankName: 'HDFC Bank', bankRefNumber: 'HDFC345678', bankTransferDate: '2025-02-05', status: 'Paid', remarks: 'Delivered' },
  { srNo: 4, clientName: 'Global Enterprises', itemDescription: 'Training Program', invoiceNo: 'INV-2025-004', invoiceDate: '2025-02-10', invoiceAmount: 8500.00, invoiceType: 'Service', transferAmount: 5000.00, bankName: 'Axis Bank', bankRefNumber: 'AXIS901234', bankTransferDate: '2025-02-15', status: 'Partial', remarks: 'Partial payment received' },
  { srNo: 5, clientName: 'Innovation Labs', itemDescription: 'R&D Services', invoiceNo: 'INV-2025-005', invoiceDate: '2025-02-15', invoiceAmount: 12000.00, invoiceType: 'Service', transferAmount: 0.00, bankName: 'Pending', bankRefNumber: 'N/A', bankTransferDate: 'N/A', status: 'Unpaid', remarks: 'Payment due' },
  { srNo: 6, clientName: 'Digital Marketing Co', itemDescription: 'Marketing Campaign', invoiceNo: 'INV-2025-006', invoiceDate: '2025-02-20', invoiceAmount: 3500.00, invoiceType: 'Service', transferAmount: 3500.00, bankName: 'Kotak Bank', bankRefNumber: 'KOT567890', bankTransferDate: '2025-02-25', status: 'Paid', remarks: 'Campaign completed' },
  { srNo: 7, clientName: 'Finance Group', itemDescription: 'Audit Services', invoiceNo: 'INV-2025-007', invoiceDate: '2025-03-01', invoiceAmount: 20000.00, invoiceType: 'Service', transferAmount: 20000.00, bankName: 'State Bank', bankRefNumber: 'SB234567', bankTransferDate: '2025-03-05', status: 'Paid', remarks: 'Audit completed' },
  { srNo: 8, clientName: 'Cloud Systems', itemDescription: 'Cloud Infrastructure', invoiceNo: 'INV-2025-008', invoiceDate: '2025-03-05', invoiceAmount: 7500.00, invoiceType: 'Service', transferAmount: 7500.00, bankName: 'ICICI Bank', bankRefNumber: 'ICICI012345', bankTransferDate: '2025-03-10', status: 'Paid', remarks: 'Monthly subscription' },
  { srNo: 9, clientName: 'Retail Dynamics', itemDescription: 'POS System Setup', invoiceNo: 'INV-2025-009', invoiceDate: '2025-03-10', invoiceAmount: 10000.00, invoiceType: 'Product', transferAmount: 0.00, bankName: 'Pending', bankRefNumber: 'N/A', bankTransferDate: 'N/A', status: 'Pending', remarks: 'Installation pending' },
  { srNo: 10, clientName: 'Manufacturing Plus', itemDescription: 'Equipment Maintenance', invoiceNo: 'INV-2025-010', invoiceDate: '2025-03-15', invoiceAmount: 6000.00, invoiceType: 'Service', transferAmount: 6000.00, bankName: 'HDFC Bank', bankRefNumber: 'HDFC456789', bankTransferDate: '2025-03-20', status: 'Paid', remarks: 'Annual maintenance' }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Invoice.deleteMany({});
    console.log('Cleared existing invoices');

    // Insert sample data
    await Invoice.insertMany(sampleInvoices);
    console.log('Sample invoices inserted successfully');
    
    console.log(`${sampleInvoices.length} invoices added to the database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
