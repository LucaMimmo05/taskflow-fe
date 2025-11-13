import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  menuItems = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'inbox', label: 'Inbox', route: '/inbox' },
    { icon: 'calendar', label: 'Calendario', route: '/calendar' },
    { icon: 'users', label: 'Team', route: '/team' },
    { icon: 'folder', label: 'Progetti', route: '/projects' },
    { icon: 'star', label: 'Preferiti', route: '/favorites' }
  ];

  projects = [
    { id: 1, name: 'Progetto Alpha', color: '#8b5cf6' },
    { id: 2, name: 'Progetto Beta', color: '#10b981' },
    { id: 3, name: 'Progetto Gamma', color: '#3b82f6' }
  ];
}
