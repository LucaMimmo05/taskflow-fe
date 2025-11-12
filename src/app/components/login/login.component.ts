import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showPassword = false;
  
  // Immagine laterale
  leftImagePath = `/assets/Group2.png?v=${Date.now()}`;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}

