import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentDataService, Invoice } from '../../services/payment-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-add-material-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-material-modal.html',
  styleUrl: './add-material-modal.scss'
})
export class AddMaterialModalComponent {
  @Output() materialUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = false;
  isSubmitting = false;
  errorMessage = '';
  
  invoice: Invoice | null = null;
  invoiceId = '';
  
  materialData = {
    materialReceived: '' as 'Yes' | 'No' | '',
    receiptDate: '',
    courierName: '',
    billingCustomer: ''
  };

  constructor(
    private paymentDataService: PaymentDataService,
    private notificationService: NotificationService
  ) {}

  openModal(invoice: Invoice) {
    this.invoice = invoice;
    this.invoiceId = invoice._id || '';
    this.isVisible = true;
    this.loadExistingData();
  }

  closeModal() {
    this.isVisible = false;
    this.errorMessage = '';
    this.invoice = null;
    this.modalClosed.emit();
  }

  loadExistingData() {
    if (this.invoice) {
      this.materialData = {
        materialReceived: this.invoice.materialReceived || '',
        receiptDate: this.invoice.receiptDate ? this.formatDateForInput(this.invoice.receiptDate) : '',
        courierName: this.invoice.courierName || '',
        billingCustomer: this.invoice.billingCustomer || ''
      };
    } else {
      this.resetForm();
    }
    this.errorMessage = '';
  }

  resetForm() {
    this.materialData = {
      materialReceived: '',
      receiptDate: '',
      courierName: '',
      billingCustomer: ''
    };
    this.errorMessage = '';
  }

  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.invoiceId) {
      this.errorMessage = 'Invalid invoice';
      return;
    }

    if (!this.materialData.materialReceived) {
      this.errorMessage = 'Please select whether material was received';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare data to send
    const updateData: any = {
      materialReceived: this.materialData.materialReceived
    };

    if (this.materialData.receiptDate) {
      updateData.receiptDate = this.materialData.receiptDate;
    }

    if (this.materialData.courierName.trim()) {
      updateData.courierName = this.materialData.courierName.trim();
    }

    if (this.materialData.billingCustomer.trim()) {
      updateData.billingCustomer = this.materialData.billingCustomer.trim();
    }

    this.paymentDataService.updateMaterialInfo(this.invoiceId, updateData).subscribe({
      next: (response) => {
        console.log('Material information updated successfully:', response);
        this.isSubmitting = false;
        this.notificationService.success('Material information updated successfully!');
        this.closeModal();
        this.materialUpdated.emit();
      },
      error: (error) => {
        console.error('Error updating material information:', error);
        this.errorMessage = error.error?.message || 'Failed to update material information. Please try again.';
        this.notificationService.error(this.errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}