import { Component, signal } from '@angular/core';
import { GridComponent } from './components/grid/grid';
import { NotificationComponent } from './components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [GridComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('payment-management');
}
