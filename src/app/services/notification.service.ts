import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, interval, Subscription } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import {
  Notification,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from '../models/notification.model';

/**
 * Servizio per la gestione delle notifiche
 * Comunica con il backend Quarkus per operazioni CRUD sulle notifiche
 * Implementa polling per l'aggiornamento in real-time
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  // Observable subjects per lo stato delle notifiche
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private newNotificationSubject = new Subject<Notification>();
  public newNotification$ = this.newNotificationSubject.asObservable();

  // Polling state
  private pollingSubscription: Subscription | null = null;
  private lastUnreadCount = 0;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnDestroy(): void {
    this.stopPolling();
    this.notificationsSubject.complete();
    this.unreadCountSubject.complete();
    this.newNotificationSubject.complete();
  }

  /**
   * Crea gli headers HTTP con il token di autenticazione
   * @returns HttpHeaders con Authorization Bearer token
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token && token !== 'undefined' && token !== 'null') {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Recupera tutte le notifiche dell'utente corrente
   * Ordina: non lette prima, poi per data descending
   * @returns Observable con array di notifiche
   */
  getNotifications(): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(`${this.apiUrl}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((notifications) => {
          // Assicurati che sia un array
          const notificationArray = Array.isArray(notifications) ? notifications : [];
          const sorted = this.sortNotifications(notificationArray);
          this.notificationsSubject.next(sorted);
          return sorted;
        }),
        catchError((error) => {
          console.error('Errore nel caricamento notifiche:', error);
          return of([]);
        })
      );
  }

  /**
   * Recupera il conteggio delle notifiche non lette
   * @returns Observable con numero di notifiche non lette
   */
  getUnreadCount(): Observable<number> {
    return this.http
      .get<UnreadCountResponse>(`${this.apiUrl}/count`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.unreadCount),
        tap((count) => {
          this.unreadCountSubject.next(count);
          this.lastUnreadCount = count;
        }),
        catchError((error) => {
          console.error('Errore nel caricamento conteggio notifiche:', error);
          return of(0);
        })
      );
  }

  /**
   * Marca una notifica come letta
   * @param notificationId ID della notifica
   * @returns Observable con la notifica aggiornata
   */
  markAsRead(notificationId: string): Observable<Notification> {
    return this.http
      .put<Notification>(
        `${this.apiUrl}/${notificationId}/read`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap((updatedNotification) => {
          this.updateNotificationInState(updatedNotification);
          this.decrementUnreadCount();
        }),
        catchError((error) => {
          console.error('Errore nel marcare notifica come letta:', error);
          return of({} as Notification);
        })
      );
  }

  /**
   * Marca tutte le notifiche come lette
   * @returns Observable con la risposta dell'operazione
   */
  markAllAsRead(): Observable<MarkAllAsReadResponse> {
    return this.http
      .put<MarkAllAsReadResponse>(
        `${this.apiUrl}/read-all`,
        {},
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap((response) => {
          this.markAllNotificationsAsRead();
          this.unreadCountSubject.next(0);
        }),
        catchError((error) => {
          console.error('Errore nel marcare tutte le notifiche come lette:', error);
          return of({ message: 'Error' });
        })
      );
  }

  /**
   * Avvia il polling per le notifiche in real-time
   * Controlla ogni 5-10 secondi se ci sono nuove notifiche
   * @param interval Intervallo in millisecondi (default: 7000ms)
   */
  startPolling(intervalMs: number = 7000): void {
    if (this.pollingSubscription) {
      return; // Polling già avviato
    }

    this.pollingSubscription = interval(intervalMs)
      .pipe(
        switchMap(() => this.getUnreadCount()),
        tap((count) => {
          // Se il conteggio è aumentato, carica le notifiche
          if (count > this.lastUnreadCount) {
            this.getNotifications().subscribe();
          }
        })
      )
      .subscribe({
        error: (error) => {
          console.warn('Errore durante il polling notifiche:', error);
          // Continua il polling anche in caso di errore
        },
      });
  }

  /**
   * Ferma il polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Ordina le notifiche: non lette prima, poi per data descending
   * @param notifications Array di notifiche da ordinare
   * @returns Array ordinato di notifiche
   */
  private sortNotifications(notifications: Notification[]): Notification[] {
    // Assicurati che sia un array
    if (!Array.isArray(notifications)) {
      return [];
    }

    return [...notifications].sort((a, b) => {
      // Non lette prima
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      // Ordina per data descending (più recente prima)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Aggiorna una notifica nello stato
   * @param notification Notifica aggiornata
   */
  private updateNotificationInState(notification: Notification): void {
    const current = this.notificationsSubject.value;
    const updated = current.map((n) => (n.id === notification.id ? notification : n));
    this.notificationsSubject.next(this.sortNotifications(updated));
  }

  /**
   * Decrementa il conteggio delle notifiche non lette
   */
  private decrementUnreadCount(): void {
    const current = this.unreadCountSubject.value;
    if (current > 0) {
      this.unreadCountSubject.next(current - 1);
    }
  }

  /**
   * Marca tutte le notifiche come lette nello stato
   */
  private markAllNotificationsAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map((n) => ({ ...n, isRead: true }));
    this.notificationsSubject.next(this.sortNotifications(updated));
  }

  /**
   * Riceve una nuova notifica (simulazione o integrazione WebSocket)
   * @param notification Notifica ricevuta
   */
  receiveNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    const updated = [notification, ...current];
    this.notificationsSubject.next(this.sortNotifications(updated));

    // Incrementa il conteggio se non letta
    if (!notification.isRead) {
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }

    // Emette la notifica per i toast
    this.newNotificationSubject.next(notification);
  }

  /**
   * Ottiene le notifiche attuali senza fare una nuova richiesta
   * @returns Array di notifiche
   */
  getNotificationsSync(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Ottiene il conteggio non letto attuale senza fare una nuova richiesta
   * @returns Numero di notifiche non lette
   */
  getUnreadCountSync(): number {
    return this.unreadCountSubject.value;
  }
}
