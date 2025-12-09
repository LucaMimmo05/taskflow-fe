import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationToastService, Toast } from '../../services/notification-toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div
          class="toast"
          [class.toast-notification]="toast.type === 'notification'"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-warning]="toast.type === 'warning'"
          [@slideIn]
          (mouseenter)="pauseAutoClose(toast.id)"
          (mouseleave)="resumeAutoClose(toast.id)"
        >
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('notification') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              }
              @case ('success') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              }
              @case ('error') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
            }
          </div>

          <div class="toast-content">
            <h4 class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          @if (toast.action) {
            <button class="toast-action-btn" (click)="executeAction(toast)">
              {{ toast.action.label }}
            </button>
          }

          <button class="toast-close-btn" (click)="closeToast(toast.id)" aria-label="Chiudi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="toast-progress" [style.animation-duration.ms]="(toast.duration || 5000)"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      pointer-events: none;

      @media (max-width: 640px) {
        bottom: 16px;
        right: 16px;
        left: 16px;
      }
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      pointer-events: all;
      max-width: 360px;
      animation: slideIn 0.3s ease-out forwards;
      position: relative;
      overflow: hidden;

      @media (prefers-color-scheme: dark) {
        background: rgba(26, 26, 46, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
      }

      @media (max-width: 640px) {
        max-width: 100%;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 6px;
      color: white;
    }

    .toast-notification .toast-icon {
      background: #2196F3;
    }

    .toast-success .toast-icon {
      background: #4CAF50;
    }

    .toast-error .toast-icon {
      background: #F44336;
    }

    .toast-warning .toast-icon {
      background: #FF9800;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      margin: 0 0 2px 0;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);

      @media (prefers-color-scheme: dark) {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .toast-message {
      margin: 0;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;

      @media (prefers-color-scheme: dark) {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .toast-action-btn {
      flex-shrink: 0;
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: #2196F3;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;

      .toast-notification & {
        color: #2196F3;
      }

      .toast-success & {
        color: #4CAF50;
      }

      .toast-error & {
        color: #F44336;
      }

      .toast-warning & {
        color: #FF9800;
      }

      &:hover {
        background: rgba(33, 150, 243, 0.1);
      }

      .toast-success &:hover {
        background: rgba(76, 175, 80, 0.1);
      }

      .toast-error &:hover {
        background: rgba(244, 67, 54, 0.1);
      }

      .toast-warning &:hover {
        background: rgba(255, 152, 0, 0.1);
      }
    }

    .toast-close-btn {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: rgba(0, 0, 0, 0.4);
      cursor: pointer;
      transition: all 0.2s ease;

      @media (prefers-color-scheme: dark) {
        color: rgba(255, 255, 255, 0.4);
      }

      &:hover {
        color: rgba(0, 0, 0, 0.7);

        @media (prefers-color-scheme: dark) {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(90deg, rgba(33, 150, 243, 0.6), rgba(33, 150, 243, 0));
      animation: progress linear forwards;
    }

    .toast-success .toast-progress {
      background: linear-gradient(90deg, rgba(76, 175, 80, 0.6), rgba(76, 175, 80, 0));
    }

    .toast-error .toast-progress {
      background: linear-gradient(90deg, rgba(244, 67, 54, 0.6), rgba(244, 67, 54, 0));
    }

    .toast-warning .toast-progress {
      background: linear-gradient(90deg, rgba(255, 152, 0, 0.6), rgba(255, 152, 0, 0));
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();
  private closeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private toastService: NotificationToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.pipe(takeUntil(this.destroy$)).subscribe((toast) => {
      this.addToast(toast);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear all timers
    this.closeTimers.forEach((timer) => clearTimeout(timer));
    this.closeTimers.clear();
  }

  addToast(toast: Toast): void {
    this.toasts.push(toast);

    // Auto-close after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      this.closeToast(toast.id);
    }, duration);

    this.closeTimers.set(toast.id, timer);
  }

  closeToast(toastId: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== toastId);
    const timer = this.closeTimers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.closeTimers.delete(toastId);
    }
  }

  pauseAutoClose(toastId: string): void {
    const timer = this.closeTimers.get(toastId);
    if (timer) {
      clearTimeout(timer);
      this.closeTimers.delete(toastId);
    }
  }

  resumeAutoClose(toastId: string): void {
    const toast = this.toasts.find((t) => t.id === toastId);
    if (toast) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        this.closeToast(toastId);
      }, duration);
      this.closeTimers.set(toastId, timer);
    }
  }

  executeAction(toast: Toast): void {
    if (toast.action) {
      toast.action.callback();
    }
    this.closeToast(toast.id);
  }
}
