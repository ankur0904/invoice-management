import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: (Notification & { id: number })[] = [];
  private subscription: Subscription | null = null;
  private idCounter = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification) => {
        const id = this.idCounter++;
        const notificationWithId = { ...notification, id };
        this.notifications.push(notificationWithId);

        // Auto-remove after duration
        setTimeout(() => {
          this.removeNotification(id);
        }, notification.duration || 3000);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }
}
