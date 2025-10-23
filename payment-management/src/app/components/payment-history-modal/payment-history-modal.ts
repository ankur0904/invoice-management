import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentDataService, Payment } from '../../services/payment-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-payment-history-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history-modal.html',
  styleUrl: './payment-history-modal.scss'
})
export class PaymentHistoryModalComponent {
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  isLoading = false;
  invoiceId = '';
  
  invoiceData: any = {
    invoiceNo: '',
    clientName: '',
    invoiceAmount: 0,
    currency: 'USD',
    transferAmount: 0,
    payments: []
  };

  constructor(
    private paymentDataService: PaymentDataService,
    private notificationService: NotificationService
  ) {}

  openModal(invoiceId: string) {
    this.invoiceId = invoiceId;
    this.isVisible = true;
    this.loadPayments();
  }

  closeModal() {
    this.isVisible = false;
    this.modalClosed.emit();
  }

  loadPayments() {
    if (!this.invoiceId) return;

    this.isLoading = true;
    this.paymentDataService.getPayments(this.invoiceId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.invoiceData = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.notificationService.error('Failed to load payment history');
        this.isLoading = false;
      }
    });
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  getRemainingAmount(): number {
    return this.invoiceData.invoiceAmount - (this.invoiceData.transferAmount || 0);
  }

  getProgressPercentage(): number {
    if (this.invoiceData.invoiceAmount === 0) return 0;
    return (this.invoiceData.transferAmount / this.invoiceData.invoiceAmount) * 100;
  }
}
