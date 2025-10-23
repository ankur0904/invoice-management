import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentDataService, Invoice } from '../../services/payment-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-add-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice-modal.html',
  styleUrl: './add-invoice-modal.scss'
})
export class AddInvoiceModalComponent {
  @Output() invoiceAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = false;
  errorMessage = '';

  invoice: Partial<Invoice> = {
    clientName: '',
    itemDescription: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceAmount: 0,
    currency: 'USD',
    invoiceType: 'Service',
    transferAmount: 0,
    bankName: '',
    bankRefNumber: '',
    bankTransferDate: '',
    status: 'Pending',
    remarks: ''
  };

  constructor(
    private paymentDataService: PaymentDataService,
    private notificationService: NotificationService
  ) {}

  openModal() {
    this.isVisible = true;
    this.resetForm();
  }

  closeModal() {
    this.isVisible = false;
    this.errorMessage = '';
    this.modalClosed.emit();
  }

  resetForm() {
    this.invoice = {
      clientName: '',
      itemDescription: '',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceAmount: 0,
      currency: 'USD',
      invoiceType: 'Service',
      transferAmount: 0,
      bankName: '',
      bankRefNumber: '',
      bankTransferDate: '',
      status: 'Pending',
      remarks: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';

    // Convert date to proper format
    const invoiceData = {
      ...this.invoice,
      invoiceDate: new Date(this.invoice.invoiceDate as string)
    };

    this.paymentDataService.createInvoice(invoiceData).subscribe({
      next: (response) => {
        console.log('Invoice created successfully:', response);
        this.isSubmitting = false;
        this.notificationService.success(`Invoice ${this.invoice.invoiceNo} created successfully!`);
        this.closeModal();
        this.invoiceAdded.emit();
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.errorMessage = error.error?.message || 'Failed to create invoice. Please try again.';
        this.notificationService.error(this.errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}
