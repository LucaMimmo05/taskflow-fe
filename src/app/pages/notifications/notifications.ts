import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { NotificationToastService } from '../../services/notification-toast.service';
import { TaskService } from '../../services/task.service';
import { NotificationItemComponent } from '../../components/notification-item/notification-item';
import { Notification } from '../../models/notification.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationItemComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  readNotifications: Notification[] = [];

  loading = true;
  error: string | null = null;
  searchQuery = '';
  unreadCount = 0;
  selectedFilter: 'all' | 'unread' | 'read' = 'all';

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private toastService: NotificationToastService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();

    // Subscribe to unread count updates
    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.unreadCount = count;
    });

    // Subscribe to notifications updates
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
        this.filterAndSortNotifications();
      });

    // Subscribe to new notifications for toast
    this.notificationService.newNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.showNewNotificationToast(notification);
      });

    // Start polling for real-time updates
    this.notificationService.startPolling(7000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationService.stopPolling();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.filterAndSortNotifications();
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento notifiche:', error);
        this.error = 'Errore nel caricamento delle notifiche';
        this.loading = false;
      },
    });

    // Also get unread count
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (error) => {
        console.error('Errore nel caricamento conteggio notifiche:', error);
      },
    });
  }

  filterAndSortNotifications(): void {
    let filtered = [...this.notifications];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.message.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.senderName.toLowerCase().includes(query)
      );
    }

    // Separate unread and read
    this.unreadNotifications = filtered.filter((n) => !n.isRead);
    this.readNotifications = filtered.filter((n) => n.isRead);

    // Apply tab filter
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.unreadNotifications;
        break;
      case 'read':
        this.filteredNotifications = this.readNotifications;
        break;
      case 'all':
      default:
        this.filteredNotifications = [...this.unreadNotifications, ...this.readNotifications];
        break;
    }
  }

  onSearchChange(): void {
    this.filterAndSortNotifications();
  }

  onFilterChange(filter: 'all' | 'unread' | 'read'): void {
    this.selectedFilter = filter;
    this.filterAndSortNotifications();
  }

  onNotificationClick(notification: Notification): void {
    // Navigate to the related entity
    if (notification.entityType === 'task' && notification.entityId) {
      // Per i task, dobbiamo recuperare il projectId prima di navigare
      this.taskService.getTaskById(notification.entityId).subscribe({
        next: (task: Task) => {
          this.router.navigate(['/projects', task.projectId, 'tasks', task.id]);
        },
        error: (error: any) => {
          console.error('Errore nel recuperare il task:', error);
          this.toastService.showError('Errore', 'Task non trovato');
        },
      });
    } else if (notification.entityType === 'project' && notification.entityId) {
      this.router.navigate(['/projects', notification.entityId]);
    }
  }

  onMarkAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updated) => {
        const index = this.notifications.findIndex((n) => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index] = updated;
          this.filterAndSortNotifications();
        }
      },
      error: (error) => {
        console.error('Errore nel marcare notifica come letta:', error);
        this.toastService.showError(
          'Errore',
          'Non è stato possibile marcare la notifica come letta'
        );
      },
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.showSuccess('Fatto', 'Tutte le notifiche marcate come lette');
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Errore nel marcare tutte le notifiche come lette:', error);
        this.toastService.showError('Errore', 'Non è stato possibile marcare le notifiche');
      },
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterAndSortNotifications();
  }

  private showNewNotificationToast(notification: Notification): void {
    const truncatedMessage =
      notification.message.substring(0, 80) + (notification.message.length > 80 ? '...' : '');
    const senderName = notification.senderName || 'Sistema';

    this.toastService.showNotificationByType(notification.type, senderName, truncatedMessage, {
      label: 'Vedi',
      callback: () => {
        this.onNotificationClick(notification);
      },
    });
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotifications.length > 0;
  }

  get hasReadNotifications(): boolean {
    return this.readNotifications.length > 0;
  }

  get noNotifications(): boolean {
    return this.notifications.length === 0;
  }
}
