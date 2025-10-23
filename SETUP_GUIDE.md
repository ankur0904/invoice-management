# Invoice Management System - Setup Guide

This guide will help you connect your Angular frontend with the Node.js backend and test the "Add Invoice" functionality.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- MongoDB installed and running locally
- Git Bash or PowerShell terminal

## Project Structure

```
invoice-project/
├── invoice-management-apis/    # Node.js Backend
│   ├── models/
│   ├── routes/
│   └── app.js
└── payment-management/         # Angular Frontend
    └── src/
        ├── app/
        │   ├── components/
        │   │   ├── grid/
        │   │   └── add-invoice-modal/
        │   └── services/
        └── ...
```

## Backend Setup (invoice-management-apis)

### 1. Install Dependencies

```powershell
cd invoice-management-apis
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your machine:

```powershell
# If MongoDB is installed as a service, it should already be running
# Otherwise, start it manually:
mongod
```

### 3. (Optional) Seed Sample Data

```powershell
npm run seed
```

### 4. Start Backend Server

```powershell
npm start
```

The backend will run on **http://localhost:3000**

API Endpoints:
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

## Frontend Setup (payment-management)

### 1. Install Dependencies

Open a **new terminal window** and navigate to the frontend:

```powershell
cd payment-management
npm install
```

### 2. Start Frontend Development Server

```powershell
npm start
```

The frontend will run on **http://localhost:4200**

## Testing the Integration

### Step 1: Verify Backend is Running

1. Open browser and go to: http://localhost:3000
2. You should see the API welcome message with available endpoints

### Step 2: Verify Frontend is Running

1. Open browser and go to: http://localhost:4200
2. You should see the Invoices List page with the grid

### Step 3: Test "Add Invoice" Feature

1. Click the **"Add Invoice"** button (blue button at the top of the page)
2. Fill in the invoice form with test data:
   - **Sr. No.**: 11
   - **Client Name**: Test Client
   - **Item Description**: Test Service
   - **Invoice No.**: INV-2025-011
   - **Invoice Date**: Select today's date
   - **Invoice Amount**: 1000
   - **Invoice Type**: Service
   - **Transfer Amount**: 1000
   - **Bank Name**: Test Bank
   - **Status**: Paid
   - Other fields are optional
3. Click **"Add Invoice"** button in the modal
4. The modal should close and the grid should refresh with the new invoice

### Step 4: Verify Data in Backend

Check if the invoice was saved to MongoDB:

```powershell
# In the backend terminal, you can check MongoDB directly
# Or make a GET request
curl http://localhost:3000/api/invoices
```

## Features Implemented

### Backend (invoice-management-apis)
- ✅ MongoDB connection with Mongoose
- ✅ Invoice model with validation
- ✅ RESTful API routes
- ✅ CORS enabled for frontend access
- ✅ Error handling middleware

### Frontend (payment-management)
- ✅ PaymentDataService with HttpClient
- ✅ Integration with backend API
- ✅ Add Invoice Modal with all fields:
  - Sr. No.
  - Client Name
  - Item Description
  - Invoice No.
  - Invoice Date
  - Invoice Amount
  - Invoice Type (Service/Product/License)
  - Transfer Amount
  - Bank Name
  - Bank Reference Number
  - Bank Transfer Date
  - Status (Paid/Pending/Partial/Unpaid)
  - Remarks
- ✅ Form validation
- ✅ Auto-refresh grid after adding invoice
- ✅ Error handling and loading states
- ✅ Responsive modal design

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Make sure MongoDB is running. Start it with `mongod` command.

**Port 3000 Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::3000
```
Solution: Kill the process using port 3000 or change the port in `app.js`

### Frontend Issues

**CORS Error:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/invoices' from origin 'http://localhost:4200' has been blocked by CORS policy
```
Solution: This should not happen as CORS is already enabled in the backend. If it does, verify the backend is running.

**Cannot Connect to Backend:**
- Verify backend is running on port 3000
- Check browser console for errors
- Verify the API URL in `payment-data.service.ts` is correct

## Next Steps

- Add edit functionality for existing invoices
- Add delete functionality
- Implement filters by status, date range, etc.
- Add pagination for large datasets
- Implement authentication and authorization
- Add invoice PDF export feature

## API Request Examples

### Create Invoice (POST)

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "srNo": 12,
    "clientName": "API Test Client",
    "itemDescription": "API Testing Service",
    "invoiceNo": "INV-2025-012",
    "invoiceDate": "2025-10-23",
    "invoiceAmount": 2500,
    "invoiceType": "Service",
    "transferAmount": 2500,
    "bankName": "Test Bank",
    "status": "Paid"
  }'
```

### Get All Invoices (GET)

```bash
curl http://localhost:3000/api/invoices
```

## Support

For issues or questions, check:
- Backend logs in the terminal running `npm start`
- Frontend console in browser DevTools (F12)
- Network tab in DevTools to see API requests/responses
