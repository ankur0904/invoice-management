import { Component, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import type { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community'; // Column Definition Type Interface
import { GridExportService } from '../../services/grid-export.service';
import { PaymentDataService, Invoice } from '../../services/payment-data.service';
import { AddInvoiceModalComponent } from '../add-invoice-modal/add-invoice-modal';
import { EditInvoiceModalComponent } from '../edit-invoice-modal/edit-invoice-modal';
import { InvoiceDetailsModalComponent } from '../invoice-details-modal/invoice-details-modal';
import { AddPaymentModalComponent } from '../add-payment-modal/add-payment-modal';
import { AddMaterialModalComponent } from '../add-material-modal/add-material-modal';
import { PaymentHistoryModalComponent } from '../payment-history-modal/payment-history-modal';
import { NotificationService } from '../../services/notification.service';
import { Filters, FilterCriteria } from '../filters/filters';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [AgGridAngular, AddInvoiceModalComponent, EditInvoiceModalComponent, InvoiceDetailsModalComponent, AddPaymentModalComponent, AddMaterialModalComponent, PaymentHistoryModalComponent, Filters], // Add Angular Data Grid Component
  styleUrl: './grid.scss',
  templateUrl: './grid.html',
})
export class GridComponent {
  @ViewChild(AddInvoiceModalComponent) addInvoiceModal!: AddInvoiceModalComponent;
  @ViewChild(EditInvoiceModalComponent) editInvoiceModal!: EditInvoiceModalComponent;
  @ViewChild(InvoiceDetailsModalComponent) invoiceDetailsModal!: InvoiceDetailsModalComponent;
  @ViewChild(AddPaymentModalComponent) addPaymentModal!: AddPaymentModalComponent;
  @ViewChild(AddMaterialModalComponent) addMaterialModal!: AddMaterialModalComponent;
  @ViewChild(PaymentHistoryModalComponent) paymentHistoryModal!: PaymentHistoryModalComponent;
  
  private gridApi: GridApi | null = null;

  // Pagination settings
  public pagination = true;
  public paginationPageSize = 10;
  public paginationPageSizeSelector = [10, 20, 50, 100];

  // Filter data
  allInvoices: Invoice[] = [];
  uniqueBanks: string[] = [];
  activeFilters: FilterCriteria = {};

  constructor(
    private GridExportService: GridExportService,
    private paymentDataService: PaymentDataService,
    private notificationService: NotificationService
  ) {}

  ngOnChanges() {
    // when inputs changes
  }

  ngOnInit() {
    this.loadInvoices();
  }

  ngAfterViewInit() {

  }

  // tables
  rowData: Invoice[] = [];

  colDefs: ColDef[] = [
    { field: 'srNo', headerName: 'Sr. No.', width: 80 },
    { field: 'clientName', headerName: 'Client Name' },
    { field: 'itemDescription', headerName: 'Item Description' },
    { 
      field: 'invoiceNo', 
      headerName: 'Invoice No.',
      cellRenderer: (params: ICellRendererParams) => {
        return `<span class="invoice-link" style="color: #093670; cursor: pointer; text-decoration: underline;">${params.value}</span>`;
      },
      onCellClicked: (params) => {
        this.showInvoiceDetails(params.data);
      }
    },
    { field: 'invoiceDate', headerName: 'Invoice Date', valueFormatter: (params) => {
      if (params.value) {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      }
      return '';
    }},
    { field: 'invoiceAmount', headerName: 'Invoice Amount'},
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'invoiceType', headerName: 'Invoice Type' },
    { 
      field: 'transferAmount', 
      headerName: 'Transfer Amount',
      cellRenderer: (params: ICellRendererParams) => {
        return `<span class="transfer-link" style="color: #28a745; cursor: pointer; text-decoration: underline; font-weight: 600;">${params.value || 0}</span>`;
      },
      onCellClicked: (params) => {
        this.showPaymentHistory(params.data);
      }
    },
    { field: 'bankName', headerName: 'Bank Name'},
    { field: 'bankRefNumber', headerName: 'Bank Reference Number'},
    { field: 'bankTransferDate', headerName: 'Bank Transfer Date'},
    { field: 'status', headerName: 'Status'},
    { field: 'remarks', headerName: 'Remarks' },
    { 
      field: 'materialReceived', 
      headerName: 'Material Received',
      width: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value || 'No';
        const color = value === 'Yes' ? '#28a745' : '#dc3545';
        return `<span style="color: ${color}; font-weight: 600;">${value}</span>`;
      }
    },
    { 
      field: 'receiptDate', 
      headerName: 'Receipt Date',
      width: 120,
      valueFormatter: (params) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString();
        }
        return '';
      }
    },
    { field: 'courierName', headerName: 'Courier Name', width: 130 },
    { field: 'billingCustomer', headerName: 'Billing Customer', width: 140 },
    {
      headerName: 'Actions',
      width: 250,
      cellRenderer: (params: ICellRendererParams) => {
        return `<button class="payment-btn" title="Add Payment" data-action="payment">
                  <i class="fa-solid fa-money-bill-wave"></i>
                </button>
                <button class="edit-btn" title="Edit Invoice" data-action="edit">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="material-btn" title="Update Material Info" data-action="material">
                  <i class="fa-solid fa-box"></i>
                </button>
                <button class="delete-btn" title="Delete Invoice" data-action="delete">
                  <i class="fa-solid fa-trash"></i>
                </button>`;
      },
      onCellClicked: (event) => {
        const target = event?.event?.target as HTMLElement;
        const button = target?.closest('button');
        
        if (button) {
          const action = button.getAttribute('data-action');
          if (action === 'payment') {
            this.addPayment(event.data);
          } else if (action === 'edit') {
            this.editInvoice(event.data);
          } else if (action === 'material') {
            this.updateMaterial(event.data);
          } else if (action === 'delete') {
            this.deleteInvoice(event.data);
          }
        }
      }
    }
  ];

  // Grid ready event handler
  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }

  // Load invoices from backend
  loadInvoices() {
    this.paymentDataService.getAllInvoices().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allInvoices = response.data;
          this.rowData = response.data;
          this.extractUniqueBanks();
          this.applyActiveFilters();
          console.log('Loaded invoices:', this.rowData.length);
        }
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        // Fallback to sample data if backend is not available
        this.loadSampleData();
      }
    });
  }

  // Extract unique bank names for filter dropdown
  extractUniqueBanks() {
    const banks = this.allInvoices.map(invoice => invoice.bankName);
    this.uniqueBanks = [...new Set(banks)].filter(bank => bank && bank !== 'Pending').sort();
  }

  // Apply filters
  onFilterApplied(filters: FilterCriteria) {
    this.activeFilters = filters;
    this.applyActiveFilters();
    this.notificationService.info('Filters applied successfully');
  }

  // Clear filters
  onFilterCleared() {
    this.activeFilters = {};
    this.rowData = [...this.allInvoices];
    this.notificationService.info('Filters cleared');
  }

  // Apply active filters to data
  applyActiveFilters() {
    let filteredData = [...this.allInvoices];

    if (this.activeFilters.bankName) {
      filteredData = filteredData.filter(invoice => 
        invoice.bankName === this.activeFilters.bankName
      );
    }

    if (this.activeFilters.status) {
      filteredData = filteredData.filter(invoice => 
        invoice.status === this.activeFilters.status
      );
    }

    if (this.activeFilters.invoiceType) {
      filteredData = filteredData.filter(invoice => 
        invoice.invoiceType === this.activeFilters.invoiceType
      );
    }

    if (this.activeFilters.bankTransferDate) {
      filteredData = filteredData.filter(invoice => {
        if (!invoice.bankTransferDate) return false;
        const invoiceDate = new Date(invoice.bankTransferDate).toISOString().split('T')[0];
        return invoiceDate === this.activeFilters.bankTransferDate;
      });
    }

    this.rowData = filteredData;
  }

  // Fallback sample data
  loadSampleData() {
    this.allInvoices = [
      { srNo: 1, clientName: 'ABC Corporation', itemDescription: 'Consulting Services', invoiceNo: 'INV-2025-001', invoiceDate: '2025-01-15', invoiceAmount: 5000.00, currency: 'USD', invoiceType: 'Service', transferAmount: 5000.00, bankName: 'State Bank', bankRefNumber: 'SB123456', bankTransferDate: '2025-01-20', status: 'Paid', remarks: 'On time payment', materialReceived: 'Yes', receiptDate: '2025-01-22', courierName: 'FedEx', billingCustomer: 'ABC Corporation' },
      { srNo: 2, clientName: 'XYZ Ltd', itemDescription: 'Software License', invoiceNo: 'INV-2025-002', invoiceDate: '2025-01-20', invoiceAmount: 2500.00, currency: 'EUR', invoiceType: 'License', transferAmount: 2500.00, bankName: 'ICICI Bank', bankRefNumber: 'ICICI789012', bankTransferDate: '2025-01-25', status: 'Pending', remarks: 'Awaiting approval', materialReceived: 'No', receiptDate: '', courierName: '', billingCustomer: 'XYZ Ltd' },
      { srNo: 3, clientName: 'Tech Solutions Inc', itemDescription: 'Hardware Supply', invoiceNo: 'INV-2025-003', invoiceDate: '2025-02-01', invoiceAmount: 15000.00, currency: 'GBP', invoiceType: 'Product', transferAmount: 15000.00, bankName: 'HDFC Bank', bankRefNumber: 'HDFC345678', bankTransferDate: '2025-02-05', status: 'Paid', remarks: 'Delivered', materialReceived: 'Yes', receiptDate: '2025-02-06', courierName: 'DHL', billingCustomer: 'Tech Solutions Inc' },
      { srNo: 4, clientName: 'Global Enterprises', itemDescription: 'Training Program', invoiceNo: 'INV-2025-004', invoiceDate: '2025-02-10', invoiceAmount: 8500.00, currency: 'INR', invoiceType: 'Service', transferAmount: 5000.00, bankName: 'Axis Bank', bankRefNumber: 'AXIS901234', bankTransferDate: '2025-02-15', status: 'Partial', remarks: 'Partial payment received', materialReceived: 'Yes', receiptDate: '2025-02-12', courierName: 'Local Courier', billingCustomer: 'Global Enterprises' },
      { srNo: 5, clientName: 'Innovation Labs', itemDescription: 'R&D Services', invoiceNo: 'INV-2025-005', invoiceDate: '2025-02-15', invoiceAmount: 12000.00, currency: 'CNY', invoiceType: 'Service', transferAmount: 0.00, bankName: 'Pending', bankRefNumber: 'N/A', bankTransferDate: 'N/A', status: 'Unpaid', remarks: 'Payment due', materialReceived: 'No', receiptDate: '', courierName: '', billingCustomer: 'Innovation Labs' },
      { srNo: 6, clientName: 'Digital Marketing Co', itemDescription: 'Marketing Campaign', invoiceNo: 'INV-2025-006', invoiceDate: '2025-02-20', invoiceAmount: 3500.00, currency: 'USD', invoiceType: 'Service', transferAmount: 3500.00, bankName: 'Kotak Bank', bankRefNumber: 'KOT567890', bankTransferDate: '2025-02-25', status: 'Paid', remarks: 'Campaign completed', materialReceived: 'Yes', receiptDate: '2025-02-21', courierName: 'UPS', billingCustomer: 'Digital Marketing Co' },
      { srNo: 7, clientName: 'Finance Group', itemDescription: 'Audit Services', invoiceNo: 'INV-2025-007', invoiceDate: '2025-03-01', invoiceAmount: 20000.00, currency: 'JPY', invoiceType: 'Service', transferAmount: 20000.00, bankName: 'State Bank', bankRefNumber: 'SB234567', bankTransferDate: '2025-03-05', status: 'Paid', remarks: 'Audit completed', materialReceived: 'Yes', receiptDate: '2025-03-02', courierName: 'DHL Express', billingCustomer: 'Finance Group' },
      { srNo: 8, clientName: 'Cloud Systems', itemDescription: 'Cloud Infrastructure', invoiceNo: 'INV-2025-008', invoiceDate: '2025-03-05', invoiceAmount: 7500.00, currency: 'AUD', invoiceType: 'Service', transferAmount: 7500.00, bankName: 'ICICI Bank', bankRefNumber: 'ICICI012345', bankTransferDate: '2025-03-10', status: 'Paid', remarks: 'Monthly subscription', materialReceived: 'No', receiptDate: '', courierName: '', billingCustomer: 'Cloud Systems' },
      { srNo: 9, clientName: 'Retail Dynamics', itemDescription: 'POS System Setup', invoiceNo: 'INV-2025-009', invoiceDate: '2025-03-10', invoiceAmount: 10000.00, currency: 'CAD', invoiceType: 'Product', transferAmount: 0.00, bankName: 'Pending', bankRefNumber: 'N/A', bankTransferDate: 'N/A', status: 'Pending', remarks: 'Installation pending', materialReceived: 'No', receiptDate: '', courierName: '', billingCustomer: 'Retail Dynamics' },
      { srNo: 10, clientName: 'Manufacturing Plus', itemDescription: 'Equipment Maintenance', invoiceNo: 'INV-2025-010', invoiceDate: '2025-03-15', invoiceAmount: 6000.00, currency: 'AED', invoiceType: 'Service', transferAmount: 6000.00, bankName: 'HDFC Bank', bankRefNumber: 'HDFC456789', bankTransferDate: '2025-03-20', status: 'Paid', remarks: 'Annual maintenance', materialReceived: 'Yes', receiptDate: '2025-03-16', courierName: 'Aramex', billingCustomer: 'Manufacturing Plus' }
    ];
    this.rowData = [...this.allInvoices];
    this.extractUniqueBanks();
  }

  // helpers
  onFilterTextBoxChanged() {
    if (this.gridApi) {
      this.gridApi.setGridOption(
        "quickFilterText",
        (document.getElementById("filter-text-box-ledger") as HTMLInputElement).value,
      )
    }
  }

  onExportExcel(){
    this.GridExportService.exportAsExcel(this.gridApi, 'invoices.csv');
  }

  openAddInvoiceModal() {
    this.addInvoiceModal.openModal();
  }

  onInvoiceAdded() {
    console.log('Invoice added, refreshing grid...');
    this.loadInvoices();
  }

  editInvoice(invoice: Invoice) {
    this.editInvoiceModal.openModal(invoice);
  }

  onInvoiceUpdated() {
    console.log('Invoice updated, refreshing grid...');
    this.loadInvoices();
  }

  addPayment(invoice: Invoice) {
    this.addPaymentModal.openModal(invoice);
  }

  onPaymentAdded() {
    console.log('Payment added, refreshing grid...');
    this.loadInvoices();
  }

  updateMaterial(invoice: Invoice) {
    this.addMaterialModal.openModal(invoice);
  }

  onMaterialUpdated() {
    console.log('Material information updated, refreshing grid...');
    this.loadInvoices();
  }

  showPaymentHistory(invoice: Invoice) {
    if (invoice._id) {
      this.paymentHistoryModal.openModal(invoice._id);
    }
  }

  showInvoiceDetails(invoice: Invoice) {
    this.invoiceDetailsModal.openModal(invoice);
  }

  deleteInvoice(invoice: Invoice) {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice ${invoice.invoiceNo}?\n\nClient: ${invoice.clientName}\nAmount: $${invoice.invoiceAmount}\n\nThis action cannot be undone.`
    );

    if (confirmed && invoice._id) {
      this.paymentDataService.deleteInvoice(invoice._id).subscribe({
        next: (response) => {
          console.log('Invoice deleted successfully:', response);
          this.notificationService.success(`Invoice ${invoice.invoiceNo} deleted successfully!`);
          this.loadInvoices();
        },
        error: (error) => {
          console.error('Error deleting invoice:', error);
          this.notificationService.error('Failed to delete invoice. Please try again.');
        }
      });
    }
  }
}
