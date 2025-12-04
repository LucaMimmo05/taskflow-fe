import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar, MobileMenu],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  isMobile = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1024; // $breakpoint-lg
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
