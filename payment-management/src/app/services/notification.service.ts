import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  success(message: string, duration: number = 3000) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration: number = 5000) {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration: number = 3000) {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration: number = 4000) {
    this.show({ message, type: 'warning', duration });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
  }
}
