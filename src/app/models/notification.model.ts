/**
 * Model per le notifiche dell'applicazione
 * Allineato con il backend Quarkus API
 */

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'taskCreated' | 'taskAssigned' | 'taskDueSoon' | 'projectInvite' | 'projectShared' | 'taskCompleted' | 'comment' | 'due' | 'info' | 'test';
  message: string;
  entityId: string;
  entityType: 'task' | 'project';
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkAsReadResponse {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: string;
  message: string;
  entityId: string;
  entityType: string;
  isRead: boolean;
  createdAt: string;
}

export interface MarkAllAsReadResponse {
  message: string;
}

export interface NotificationFilter {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}
