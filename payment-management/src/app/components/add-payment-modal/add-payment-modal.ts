import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentDataService, Invoice } from '../../services/payment-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-add-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment-modal.html',
  styleUrl: './add-payment-modal.scss'
})
export class AddPaymentModalComponent {
  @Output() paymentAdded = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = false;
  errorMessage = '';
  
  invoice: Invoice | null = null;
  invoiceId = '';
  
  payment = {
    amount: 0,
    paymentType: '',
    remarks: ''
  };

  constructor(
    private paymentDataService: PaymentDataService,
    private notificationService: NotificationService
  ) {}

  openModal(invoice: Invoice) {
    this.invoice = invoice;
    this.invoiceId = invoice._id || '';
    this.isVisible = true;
    this.resetForm();
    
    // Calculate remaining amount
    const remaining = invoice.invoiceAmount - (invoice.transferAmount || 0);
    this.payment.amount = remaining > 0 ? remaining : 0;
  }

  closeModal() {
    this.isVisible = false;
    this.errorMessage = '';
    this.invoice = null;
    this.modalClosed.emit();
  }

  resetForm() {
    this.payment = {
      amount: 0,
      paymentType: '',
      remarks: ''
    };
    this.errorMessage = '';
  }

  getRemainingAmount(): number {
    if (!this.invoice) return 0;
    return this.invoice.invoiceAmount - (this.invoice.transferAmount || 0);
  }

  onSubmit() {
    if (!this.invoiceId) {
      this.errorMessage = 'Invalid invoice';
      return;
    }

    if (!this.payment.amount || this.payment.amount <= 0) {
      this.errorMessage = 'Please enter a valid payment amount';
      return;
    }

    if (!this.payment.paymentType.trim()) {
      this.errorMessage = 'Please enter payment type';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.paymentDataService.addPayment(this.invoiceId, this.payment).subscribe({
      next: (response) => {
        console.log('Payment added successfully:', response);
        this.isSubmitting = false;
        this.notificationService.success(`Payment of ${this.payment.amount} added successfully!`);
        this.closeModal();
        this.paymentAdded.emit();
      },
      error: (error) => {
        console.error('Error adding payment:', error);
        this.errorMessage = error.error?.message || 'Failed to add payment. Please try again.';
        this.notificationService.error(this.errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}
