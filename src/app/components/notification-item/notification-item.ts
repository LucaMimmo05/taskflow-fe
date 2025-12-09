import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-item" 
         [class.unread]="!notification.isRead" 
         [class.urgent]="notification.type === 'taskDueSoon'"
         (click)="onNotificationClick()">
      <div class="notification-icon" [ngSwitch]="notification.type">
        @switch (notification.type) {
          @case ('taskCreated') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
          }
          @case ('taskAssigned') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="23 3 13 13 8 8"></polyline>
            </svg>
          }
          @case ('taskDueSoon') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          @case ('projectInvite') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          }
          @case ('projectShared') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
            </svg>
          }
          @case ('comment') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
            </svg>
          }
          @case ('taskCompleted') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          }
          @case ('due') {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          @default {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          }
        }
      </div>

      <div class="notification-body">
        <p class="notification-title">{{ notification.message }}</p>
        <p class="notification-message">{{ truncateMessage(notification.message) }}</p>
        <p class="notification-time">{{ formatDate(notification.createdAt) }}</p>
      </div>

      @if (!notification.isRead) {
        <div class="unread-indicator"></div>
      }
    </div>
  `,
  styles: [`
    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
      position: relative;

      @media (prefers-color-scheme: light) {
        border-bottom-color: rgba(0, 0, 0, 0.05);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateX(4px);

        @media (prefers-color-scheme: light) {
          background: rgba(0, 0, 0, 0.02);
        }
      }

      &.unread {
        background: rgba(255, 255, 255, 0.08);

        @media (prefers-color-scheme: light) {
          background: rgba(0, 0, 0, 0.04);
        }
      }

      &.urgent {
        background: rgba(255, 165, 0, 0.15);
        border-left: 3px solid #ff9800;

        @media (prefers-color-scheme: light) {
          background: rgba(255, 152, 0, 0.1);
        }

        .notification-icon {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }
      }
    }

    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.7);
      flex-shrink: 0;

      @media (prefers-color-scheme: light) {
        background: rgba(0, 0, 0, 0.08);
        color: rgba(0, 0, 0, 0.5);
      }
    }

    .notification-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .notification-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      line-height: 1.2;

      @media (prefers-color-scheme: light) {
        color: rgba(0, 0, 0, 0.87);
      }
    }

    .notification-message {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      line-height: 1.3;
      word-break: break-word;

      @media (prefers-color-scheme: light) {
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .notification-time {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      margin: 0;

      @media (prefers-color-scheme: light) {
        color: rgba(0, 0, 0, 0.4);
      }
    }

    .unread-indicator {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: #ff4081;
      border-radius: 50%;
    }
  `],
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Output() clicked = new EventEmitter<Notification>();
  @Output() markAsRead = new EventEmitter<Notification>();

  onNotificationClick(): void {
    if (!this.notification.isRead) {
      this.markAsRead.emit(this.notification);
    }
    this.clicked.emit(this.notification);
  }

  truncateMessage(message: string, maxLength: number = 100): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength) + '...';
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;

    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
