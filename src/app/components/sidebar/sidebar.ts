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
}
