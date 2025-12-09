import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'notification' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

/**
 * Servizio per la gestione dei toast notifiche
 * Emette toast che vengono visualizzati in basso a destra
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();

  /**
   * Mostra un toast di notifica
   * @param title Titolo della notifica
   * @param message Messaggio della notifica
   * @param duration Durata in millisecondi (default: 5000)
   * @param action Azione opzionale (es. click per navigare)
   */
  showNotification(
    title: string,
    message: string,
    duration: number = 5000,
    action?: { label: string; callback: () => void }
  ): void {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toastSubject.next({
      id,
      type: 'notification',
      title,
      message,
      duration,
      action,
    });
  }

  /**
   * Mostra un toast di successo
   * @param title Titolo del messaggio
   * @param message Contenuto del messaggio
   * @param duration Durata in millisecondi (default: 3000)
   */
  showSuccess(title: string, message: string, duration: number = 3000): void {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toastSubject.next({
      id,
      type: 'success',
      title,
      message,
      duration,
    });
  }

  /**
   * Mostra un toast di errore
   * @param title Titolo del messaggio
   * @param message Contenuto del messaggio
   * @param duration Durata in millisecondi (default: 5000)
   */
  showError(title: string, message: string, duration: number = 5000): void {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toastSubject.next({
      id,
      type: 'error',
      title,
      message,
      duration,
    });
  }

  /**
   * Mostra un toast di warning
   * @param title Titolo del messaggio
   * @param message Contenuto del messaggio
   * @param duration Durata in millisecondi (default: 4000)
   */
  showWarning(title: string, message: string, duration: number = 4000): void {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toastSubject.next({
      id,
      type: 'warning',
      title,
      message,
      duration,
    });
  }

  /**
   * Mostra un toast basato sul tipo di notifica
   * @param notificationType Tipo della notifica (taskCreated, taskAssigned, etc.)
   * @param title Titolo del toast
   * @param message Messaggio del toast
   * @param action Azione opzionale
   */
  showNotificationByType(
    notificationType: string,
    title: string,
    message: string,
    action?: { label: string; callback: () => void }
  ): void {
    const config = this.getToastConfigByType(notificationType);
    const id = `toast_${Date.now()}_${Math.random()}`;
    
    this.toastSubject.next({
      id,
      type: config.type,
      title,
      message,
      duration: config.duration,
      action,
    });
  }

  /**
   * Ottiene la configurazione del toast in base al tipo di notifica
   */
  private getToastConfigByType(notificationType: string): { type: Toast['type']; duration: number } {
    switch (notificationType) {
      case 'taskDueSoon':
        return { type: 'warning', duration: 6000 }; // Più lungo per notifiche urgenti
      case 'taskAssigned':
      case 'taskCreated':
        return { type: 'notification', duration: 5000 };
      case 'projectInvite':
        return { type: 'success', duration: 5000 };
      default:
        return { type: 'notification', duration: 5000 };
    }
  }
}
