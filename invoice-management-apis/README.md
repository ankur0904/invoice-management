# Invoice Management API

A RESTful API for managing invoices with MongoDB integration.

## Features

- Complete CRUD operations for invoices
- Filter invoices by status, client name, invoice type, and date range
- Get invoice statistics and summaries
- MongoDB integration with Mongoose
- Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on `mongodb://localhost:27017`

3. Seed the database with sample data:
```bash
node seedData.js
```

4. Start the server:
```bash
node app.js
```

The server will run on `http://localhost:3000`

## API Endpoints

### Get All Invoices
```
GET /api/invoices
```
Query Parameters:
- `status` - Filter by status (Paid, Pending, Partial, Unpaid)
- `clientName` - Filter by client name (partial match)
- `invoiceType` - Filter by type (Service, Product, License)
- `fromDate` - Filter invoices from this date
- `toDate` - Filter invoices until this date

### Get Invoice by ID
```
GET /api/invoices/:id
```

### Get Invoice by Invoice Number
```
GET /api/invoices/invoice-no/:invoiceNo
```

### Create New Invoice
```
POST /api/invoices
```
Body:
```json
{
  "srNo": 11,
  "clientName": "New Client",
  "itemDescription": "Service Description",
  "invoiceNo": "INV-2025-011",
  "invoiceDate": "2025-03-20",
  "invoiceAmount": 5000,
  "invoiceType": "Service",
  "transferAmount": 5000,
  "bankName": "State Bank",
  "bankRefNumber": "SB987654",
  "bankTransferDate": "2025-03-25",
  "status": "Paid",
  "remarks": "New invoice"
}
```

### Update Invoice
```
PUT /api/invoices/:id
```

### Update Invoice Status Only
```
PATCH /api/invoices/:id/status
```
Body:
```json
{
  "status": "Paid"
}
```

### Delete Invoice
```
DELETE /api/invoices/:id
```

### Get Invoice Statistics
```
GET /api/invoices/stats/summary
```

## Response Format

Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Invoice Schema

- `srNo` - Serial Number (unique)
- `clientName` - Client Name
- `itemDescription` - Item/Service Description
- `invoiceNo` - Invoice Number (unique)
- `invoiceDate` - Date of Invoice
- `invoiceAmount` - Total Invoice Amount
- `invoiceType` - Type (Service, Product, License)
- `transferAmount` - Amount Transferred
- `bankName` - Bank Name
- `bankRefNumber` - Bank Reference Number
- `bankTransferDate` - Transfer Date
- `status` - Status (Paid, Pending, Partial, Unpaid)
- `remarks` - Additional Remarks

## Testing with cURL

Get all invoices:
```bash
curl http://localhost:3000/api/invoices
```

Get paid invoices:
```bash
curl "http://localhost:3000/api/invoices?status=Paid"
```

Create new invoice:
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{"srNo":11,"clientName":"Test Client","itemDescription":"Test Service","invoiceNo":"INV-2025-011","invoiceDate":"2025-03-20","invoiceAmount":5000,"invoiceType":"Service","transferAmount":5000,"bankName":"Test Bank","bankRefNumber":"TB123","bankTransferDate":"2025-03-25","status":"Paid","remarks":"Test"}'
```
