import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterCriteria {
  bankName?: string;
  status?: string;
  invoiceType?: string;
  bankTransferDate?: string;
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.html',
  styleUrl: './filters.scss'
})
export class Filters {
  @Input() banks: string[] = [];
  @Input() statuses: string[] = ['Paid', 'Pending', 'Partial', 'Unpaid'];
  @Input() invoiceTypes: string[] = ['Service', 'Product', 'License'];
  @Output() filterApplied = new EventEmitter<FilterCriteria>();
  @Output() filterCleared = new EventEmitter<void>();

  filters: FilterCriteria = {
    bankName: '',
    status: '',
    invoiceType: '',
    bankTransferDate: ''
  };

  isExpanded = false;

  toggleFilters() {
    this.isExpanded = !this.isExpanded;
  }

  applyFilters() {
    const activeFilters: FilterCriteria = {};
    
    if (this.filters.bankName) activeFilters.bankName = this.filters.bankName;
    if (this.filters.status) activeFilters.status = this.filters.status;
    if (this.filters.invoiceType) activeFilters.invoiceType = this.filters.invoiceType;
    if (this.filters.bankTransferDate) activeFilters.bankTransferDate = this.filters.bankTransferDate;

    this.filterApplied.emit(activeFilters);
  }

  clearFilters() {
    this.filters = {
      bankName: '',
      status: '',
      invoiceType: '',
      bankTransferDate: ''
    };
    this.filterCleared.emit();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.bankName || this.filters.status || 
              this.filters.invoiceType || this.filters.bankTransferDate);
  }
}
