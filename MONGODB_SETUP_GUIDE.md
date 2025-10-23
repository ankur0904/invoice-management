# MongoDB Setup Guide for Invoice Management System

This guide will help you set up MongoDB and run the Invoice Management System on a new computer.

---

## Prerequisites

- Windows Operating System
- Administrator access
- Internet connection

---

## Step 1: Install MongoDB Community Edition

### Download MongoDB

1. Go to MongoDB Download Center: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: 8.0.x (or latest stable version)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### Install MongoDB

1. Run the downloaded `.msi` file
2. Click **Next** on the welcome screen
3. Accept the license agreement and click **Next**
4. Choose **Complete** installation type
5. **Install MongoDB as a Service**:
   - ✅ Check "Install MongoDB as a Service"
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\8.0\data\`
   - Log Directory: `C:\Program Files\MongoDB\Server\8.0\log\`
6. **Install MongoDB Compass** (optional but recommended):
   - ✅ Check "Install MongoDB Compass" for GUI management
7. Click **Next** and then **Install**
8. Wait for installation to complete
9. Click **Finish**

### Verify MongoDB Installation

1. Open **Command Prompt** or **PowerShell** as Administrator
2. Run:
```powershell
mongod --version
```

Expected output:
```
db version v8.0.x
Build Info: ...
```

3. Check if MongoDB service is running:
```powershell
sc query MongoDB
```

Expected output should show: `STATE: 4 RUNNING`

---

## Step 2: Start MongoDB Service (if not running)

### Option A: Using Services

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find **MongoDB** in the list
4. Right-click → **Start** (if not running)
5. Right-click → **Properties** → Set **Startup type** to **Automatic**

### Option B: Using Command Line

```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service (if needed)
net stop MongoDB

# Restart MongoDB service (if needed)
net stop MongoDB && net start MongoDB
```

---

## Step 3: Configure MongoDB (Optional)

### Default Configuration

MongoDB is configured with these defaults:
- **Host**: `localhost`
- **Port**: `27017`
- **No authentication** (for local development)

### Custom Configuration (if needed)

1. Open MongoDB config file:
```
C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg
```

2. Example configuration:
```yaml
systemLog:
  destination: file
  path: C:\Program Files\MongoDB\Server\8.0\log\mongod.log
storage:
  dbPath: C:\Program Files\MongoDB\Server\8.0\data
net:
  port: 27017
  bindIp: 127.0.0.1
```

3. Restart MongoDB service after changes

---

## Step 4: Test MongoDB Connection

### Using MongoDB Shell

1. Open Command Prompt or PowerShell
2. Connect to MongoDB:
```powershell
mongosh
```

3. You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/
Using MongoDB: 8.0.x
```

4. Test basic commands:
```javascript
// Show all databases
show dbs

// Create/switch to invoice database
use invoice_management

// Show current database
db

// Exit
exit
```

### Using MongoDB Compass (GUI)

1. Open **MongoDB Compass**
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. You should see the MongoDB interface with databases listed

---

## Step 5: Set Up Invoice Management System

### Clone/Copy Project Files

Copy your project to the new computer:
```
invoice-project/
├── invoice-management-apis/    (Backend)
└── payment-management/          (Frontend)
```

### Install Node.js (if not installed)

1. Download from: https://nodejs.org/
2. Install LTS version (v20.x or later)
3. Verify installation:
```powershell
node --version
npm --version
```

### Install Backend Dependencies

1. Open PowerShell or Command Prompt
2. Navigate to backend folder:
```powershell
cd C:\Users\YOUR_USERNAME\OneDrive\Desktop\invoice-project\invoice-management-apis
```

3. Install dependencies:
```powershell
npm install
```

This will install:
- express
- mongoose
- cors
- body-parser

### Configure Database Connection

1. Open `config/database.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice_management', {
      // No need for deprecated options in Mongoose 6+
    });
    
    console.log('MongoDB Connected:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Start Backend Server

```powershell
npm start
```

Expected output:
```
Server is running on port 3000
API Base URL: http://localhost:3000
Invoice API: http://localhost:3000/api/invoices
MongoDB Connected: localhost
Database: invoice_management
```

---

## Step 6: Install Frontend Dependencies

1. Navigate to frontend folder:
```powershell
cd C:\Users\YOUR_USERNAME\OneDrive\Desktop\invoice-project\payment-management
```

2. Install dependencies:
```powershell
npm install
```

This will install:
- Angular CLI
- AG Grid
- RxJS
- Other Angular dependencies

### Start Frontend Server

```powershell
npm start
```

Expected output:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Browser application bundle generation complete.
```

---

## Step 7: Access the Application

1. **Backend API**: http://localhost:3000
2. **Frontend App**: http://localhost:4200

### Test Backend API

Open browser or use Postman:
```
GET http://localhost:3000/api/invoices
```

Expected response:
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

---

## Troubleshooting

### Issue 1: MongoDB Service Won't Start

**Error**: "The MongoDB service failed to start"

**Solution**:
1. Check if port 27017 is already in use:
```powershell
netstat -ano | findstr :27017
```

2. Check MongoDB log file:
```
C:\Program Files\MongoDB\Server\8.0\log\mongod.log
```

3. Delete lock file if corrupted:
```powershell
# Stop MongoDB service first
net stop MongoDB

# Delete lock file
del "C:\Program Files\MongoDB\Server\8.0\data\mongod.lock"

# Start service
net start MongoDB
```

### Issue 2: Cannot Connect to MongoDB

**Error**: "MongoNetworkError: connect ECONNREFUSED"

**Solution**:
1. Verify MongoDB service is running:
```powershell
sc query MongoDB
```

2. Check connection string in `config/database.js`:
```javascript
mongodb://localhost:27017/invoice_management
```

3. Try alternative connection:
```javascript
mongodb://127.0.0.1:27017/invoice_management
```

### Issue 3: Port 3000 Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
1. Find process using port 3000:
```powershell
netstat -ano | findstr :3000
```

2. Kill the process:
```powershell
taskkill /PID <PID_NUMBER> /F
```

3. Or change port in `app.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

### Issue 4: Database Permission Issues

**Error**: "Access denied" or permission errors

**Solution**:
1. Run Command Prompt/PowerShell as **Administrator**
2. Or create data directory with proper permissions:
```powershell
mkdir C:\data\db
```

3. Update `mongod.cfg` to use the new path

---

## Database Structure

Once the system is running, MongoDB will automatically create:

### Database: `invoice_management`

### Collection: `invoices`

**Document Schema**:
```javascript
{
  _id: ObjectId,
  srNo: Number,              // Auto-generated serial number
  clientName: String,
  itemDescription: String,
  invoiceNo: String,         // Unique
  invoiceDate: Date,
  invoiceAmount: Number,
  currency: String,          // USD, EUR, GBP, INR, CNY, JPY, AUD, CAD, CHF, AED
  invoiceType: String,       // Service, Product, License
  transferAmount: Number,    // Auto-calculated from payments
  bankName: String,
  bankRefNumber: String,
  bankTransferDate: String,
  status: String,           // Paid, Pending, Partial, Unpaid
  remarks: String,
  payments: [               // Payment history
    {
      amount: Number,
      paymentType: String,
      paymentDate: Date,
      remarks: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Initial Data (Optional)

### Seed Sample Data

If you want to start with sample invoices:

1. Open MongoDB Shell:
```powershell
mongosh
```

2. Switch to database:
```javascript
use invoice_management
```

3. Insert sample invoice:
```javascript
db.invoices.insertOne({
  srNo: 1,
  clientName: "ABC Corporation",
  itemDescription: "Consulting Services",
  invoiceNo: "INV-2025-001",
  invoiceDate: new Date("2025-01-15"),
  invoiceAmount: 5000,
  currency: "USD",
  invoiceType: "Service",
  transferAmount: 0,
  bankName: "State Bank",
  bankRefNumber: "",
  bankTransferDate: "",
  status: "Unpaid",
  remarks: "Initial invoice",
  payments: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

4. Verify insertion:
```javascript
db.invoices.find().pretty()
```

---

## MongoDB GUI Tools (Optional)

### 1. MongoDB Compass (Recommended)
- **Included with MongoDB installation**
- Visual interface for database management
- Query builder
- Schema analysis

### 2. Studio 3T (Free Trial)
- Download: https://studio3t.com/
- Advanced query features
- Import/Export tools
- IntelliShell

### 3. Robo 3T (Free)
- Download: https://robomongo.org/
- Lightweight
- Shell-centric interface

---

## Backup and Restore (Important!)

### Backup Database

```powershell
# Backup entire database
mongodump --db invoice_management --out C:\mongodb_backup\

# Backup specific collection
mongodump --db invoice_management --collection invoices --out C:\mongodb_backup\
```

### Restore Database

```powershell
# Restore entire database
mongorestore --db invoice_management C:\mongodb_backup\invoice_management\

# Restore specific collection
mongorestore --db invoice_management --collection invoices C:\mongodb_backup\invoice_management\invoices.bson
```

---

## Environment Variables (Production)

For production deployment, use environment variables:

1. Create `.env` file in backend folder:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/invoice_management
NODE_ENV=development
```

2. Install dotenv:
```powershell
npm install dotenv
```

3. Update `app.js`:
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
```

4. Update `config/database.js`:
```javascript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice_management';
await mongoose.connect(mongoURI);
```

---

## Security Considerations

### For Production:

1. **Enable Authentication**:
```javascript
// Create admin user in MongoDB
use admin
db.createUser({
  user: "admin",
  pwd: "securePassword123",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

2. **Update Connection String**:
```javascript
mongodb://admin:securePassword123@localhost:27017/invoice_management?authSource=admin
```

3. **Enable SSL/TLS** in production

4. **Firewall Rules**: Restrict MongoDB port 27017 access

---

## Quick Reference Commands

### MongoDB Service
```powershell
net start MongoDB      # Start
net stop MongoDB       # Stop
sc query MongoDB       # Status
```

### MongoDB Shell
```javascript
show dbs               # List databases
use invoice_management # Switch database
show collections       # List collections
db.invoices.find()     # Show all invoices
db.invoices.countDocuments() # Count invoices
```

### Application
```powershell
# Backend
cd invoice-management-apis
npm install
npm start

# Frontend
cd payment-management
npm install
npm start
```

---

## Support and Resources

- **MongoDB Documentation**: https://docs.mongodb.com/
- **MongoDB University**: https://university.mongodb.com/ (Free courses)
- **MongoDB Community**: https://community.mongodb.com/
- **Mongoose Documentation**: https://mongoosejs.com/

---

## Checklist for New Computer Setup

- [ ] Install MongoDB Community Edition
- [ ] Start MongoDB Service
- [ ] Verify MongoDB is running (port 27017)
- [ ] Install Node.js
- [ ] Copy project files
- [ ] Install backend dependencies (`npm install`)
- [ ] Install frontend dependencies (`npm install`)
- [ ] Configure database connection
- [ ] Start backend server (port 3000)
- [ ] Start frontend server (port 4200)
- [ ] Test application at http://localhost:4200
- [ ] Create first invoice to verify system

---

## Contact & Help

If you encounter issues not covered in this guide:
1. Check MongoDB log file
2. Check backend console for errors
3. Check browser console for frontend errors
4. Verify all services are running
5. Check firewall settings

**Application URLs**:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/

---

*Last Updated: October 23, 2025*
