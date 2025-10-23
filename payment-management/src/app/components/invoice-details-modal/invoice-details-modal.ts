import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../services/payment-data.service';

@Component({
  selector: 'app-invoice-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-details-modal.html',
  styleUrl: './invoice-details-modal.scss'
})
export class InvoiceDetailsModalComponent {
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  invoice: Invoice | null = null;

  openModal(invoice: Invoice) {
    this.invoice = invoice;
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.invoice = null;
    this.modalClosed.emit();
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatCurrencyWithSymbol(amount: number | undefined, currency: string | undefined): string {
    if (amount === undefined) return '0.00';
    if (!currency) currency = 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      // Fallback if currency code is invalid
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  getCurrencyDisplay(currency: string | undefined): string {
    if (!currency) return 'USD - US Dollar';
    
    const currencyMap: { [key: string]: string } = {
      'USD': 'USD - US Dollar ($)',
      'EUR': 'EUR - Euro (€)',
      'GBP': 'GBP - British Pound (£)',
      'INR': 'INR - Indian Rupee (₹)',
      'CNY': 'CNY - Chinese Yuan (¥)',
      'JPY': 'JPY - Japanese Yen (¥)',
      'AUD': 'AUD - Australian Dollar ($)',
      'CAD': 'CAD - Canadian Dollar ($)',
      'CHF': 'CHF - Swiss Franc (Fr)',
      'AED': 'AED - UAE Dirham (د.إ)'
    };
    
    return currencyMap[currency] || currency;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'Partial': return 'status-partial';
      case 'Unpaid': return 'status-unpaid';
      default: return '';
    }
  }
}
