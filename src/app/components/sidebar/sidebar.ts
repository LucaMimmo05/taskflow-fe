import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserResponse } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  user: UserResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  getInitials(): string {
    if (!this.user?.displayName) return 'U';
    return this.user.displayName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  menuItems = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'inbox', label: 'Inbox', route: '/inbox' },
    { icon: 'calendar', label: 'Calendario', route: '/calendar' },
    { icon: 'users', label: 'Team', route: '/team' },
    { icon: 'folder', label: 'Progetti', route: '/projects' },
    { icon: 'star', label: 'Preferiti', route: '/favorites' },
  ];

  projects = [
    { id: 1, name: 'Progetto Alpha', color: '#8b5cf6' },
    { id: 2, name: 'Progetto Beta', color: '#10b981' },
    { id: 3, name: 'Progetto Gamma', color: '#3b82f6' },
  ];

  showProfilePopup = false;
  userStatus: UserStatus = 'disponibile';
  user: UserResponse | null = null;
  userName = 'Utente';
  userEmail = 'utente@example.com';
  userInitial = 'U';

  // Carica lo stato salvato dal localStorage
  constructor() {
    const savedStatus = localStorage.getItem('user_status');
    if (savedStatus && ['disponibile', 'occupato', 'in-riunione'].includes(savedStatus)) {
      this.userStatus = savedStatus as UserStatus;
    }

    // Carica i dati utente dal localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        if (this.user) {
          this.userName = this.user.displayName || 'Utente';
          this.userEmail = this.user.email || 'utente@example.com';
          // Estrai l'iniziale dal nome
          this.userInitial = this.userName.charAt(0).toUpperCase();
        }
      } catch (e) {
        console.error('Errore nel parsing dei dati utente:', e);
      }
    }
  }

  onProfileDoubleClick(): void {
    this.showProfilePopup = !this.showProfilePopup;
  }

  setStatus(status: UserStatus): void {
    this.userStatus = status;
    localStorage.setItem('user_status', status);
    this.showProfilePopup = false;
  }

  openSettings(): void {
    // TODO: Implementare navigazione alle impostazioni
    console.log('Aprire impostazioni');
    this.showProfilePopup = false;
  }

  // Chiudi il popup quando si clicca fuori
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.showProfilePopup && !target.closest('.user-menu-btn') && !target.closest('.profile-popup')) {
      this.showProfilePopup = false;
    }
  }

  getStatusColor(): string {
    switch (this.userStatus) {
      case 'disponibile':
        return '#10b981';
      case 'occupato':
        return '#fbbf24';
      case 'in-riunione':
        return '#0ea5e9';
      default:
        return '#10b981';
    }
  }

  getStatusLabel(): string {
    switch (this.userStatus) {
      case 'disponibile':
        return 'Disponibile';
      case 'occupato':
        return 'Occupato';
      case 'in-riunione':
        return 'In riunione';
      default:
        return 'Disponibile';
    }
  }
}
