import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentDataService, Invoice } from '../../services/payment-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-edit-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-invoice-modal.html',
  styleUrl: './edit-invoice-modal.scss'
})
export class EditInvoiceModalComponent {
  @Output() invoiceUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = false;
  errorMessage = '';
  invoiceId = '';

  invoice: Partial<Invoice> = {
    clientName: '',
    itemDescription: '',
    invoiceNo: '',
    invoiceDate: '',
    invoiceAmount: 0,
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

  openModal(invoice: Invoice) {
    this.invoiceId = invoice._id || '';
    this.invoice = {
      srNo: invoice.srNo,
      clientName: invoice.clientName,
      itemDescription: invoice.itemDescription,
      invoiceNo: invoice.invoiceNo,
      invoiceDate: this.formatDateForInput(invoice.invoiceDate),
      invoiceAmount: invoice.invoiceAmount,
      invoiceType: invoice.invoiceType,
      transferAmount: invoice.transferAmount,
      bankName: invoice.bankName,
      bankRefNumber: invoice.bankRefNumber,
      bankTransferDate: invoice.bankTransferDate,
      status: invoice.status,
      remarks: invoice.remarks
    };
    this.isVisible = true;
    this.errorMessage = '';
  }

  closeModal() {
    this.isVisible = false;
    this.errorMessage = '';
    this.modalClosed.emit();
  }

  formatDateForInput(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.invoiceId) {
      this.errorMessage = 'Invoice ID is missing';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const invoiceData = {
      ...this.invoice,
      invoiceDate: new Date(this.invoice.invoiceDate as string)
    };

    this.paymentDataService.updateInvoice(this.invoiceId, invoiceData).subscribe({
      next: (response) => {
        console.log('Invoice updated successfully:', response);
        this.isSubmitting = false;
        this.notificationService.success(`Invoice ${this.invoice.invoiceNo} updated successfully!`);
        this.closeModal();
        this.invoiceUpdated.emit();
      },
      error: (error) => {
        console.error('Error updating invoice:', error);
        this.errorMessage = error.error?.message || 'Failed to update invoice. Please try again.';
        this.notificationService.error(this.errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}
