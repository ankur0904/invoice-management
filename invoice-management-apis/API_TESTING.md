# API Testing Examples

You can test these endpoints using PowerShell, Postman, or any HTTP client.

## Using PowerShell

### 1. Get All Invoices
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method GET | ConvertTo-Json -Depth 10
```

### 2. Get Invoices by Status (Paid)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/invoices?status=Paid" -Method GET | ConvertTo-Json -Depth 10
```

### 3. Get Invoices by Client Name
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/invoices?clientName=ABC" -Method GET | ConvertTo-Json -Depth 10
```

### 4. Get Invoice by Invoice Number
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/invoice-no/INV-2025-001" -Method GET | ConvertTo-Json -Depth 10
```

### 5. Create New Invoice
```powershell
$body = @{
    srNo = 11
    clientName = "New Test Client"
    itemDescription = "Web Development Services"
    invoiceNo = "INV-2025-011"
    invoiceDate = "2025-03-25"
    invoiceAmount = 7500.00
    invoiceType = "Service"
    transferAmount = 0.00
    bankName = "Pending"
    bankRefNumber = "N/A"
    bankTransferDate = "N/A"
    status = "Pending"
    remarks = "New project invoice"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### 6. Update Invoice Status
```powershell
# First, get an invoice ID
$invoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method GET
$invoiceId = $invoices.data[0]._id

# Update status
$body = @{
    status = "Paid"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/$invoiceId/status" -Method PATCH -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### 7. Update Full Invoice
```powershell
$invoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method GET
$invoiceId = $invoices.data[0]._id

$body = @{
    transferAmount = 5000.00
    bankName = "Updated Bank"
    bankRefNumber = "UPD123456"
    bankTransferDate = "2025-03-26"
    status = "Partial"
    remarks = "Partial payment received"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/$invoiceId" -Method PUT -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### 8. Get Invoice Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/stats/summary" -Method GET | ConvertTo-Json -Depth 10
```

### 9. Delete Invoice
```powershell
$invoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method GET
$invoiceId = $invoices.data[0]._id

Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/$invoiceId" -Method DELETE | ConvertTo-Json -Depth 10
```

## Using cURL (if installed)

### Get All Invoices
```bash
curl http://localhost:3000/api/invoices
```

### Create New Invoice
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "srNo": 11,
    "clientName": "New Test Client",
    "itemDescription": "Web Development Services",
    "invoiceNo": "INV-2025-011",
    "invoiceDate": "2025-03-25",
    "invoiceAmount": 7500.00,
    "invoiceType": "Service",
    "transferAmount": 0.00,
    "bankName": "Pending",
    "bankRefNumber": "N/A",
    "bankTransferDate": "N/A",
    "status": "Pending",
    "remarks": "New project invoice"
  }'
```

## Quick Test in Browser

Open your browser and visit:
- http://localhost:3000/ - API Info
- http://localhost:3000/api/invoices - All Invoices
- http://localhost:3000/api/invoices?status=Paid - Paid Invoices
- http://localhost:3000/api/invoices/stats/summary - Statistics
