import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  showPassword = false;

  // Immagine laterale
  leftImagePath = `/assets/Group2.png?v=${Date.now()}`;

  formData = {
    email: '',
    password: '',
  };

  // Form state
  errors: { [key: string]: string } = {};
  isSubmitting = false;
  submitError = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;
    // Validazione email
    if (!this.formData.email || this.formData.email.trim().length === 0) {
      this.errors['email'] = "L'email è obbligatoria";
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.formData.email)) {
        this.errors['email'] = "Inserisci un'email valida";
        isValid = false;
      }
    }

    // Validazione password
    if (!this.formData.password || this.formData.password.length === 0) {
      this.errors['password'] = 'La password è obbligatoria';
      isValid = false;
    } else if (this.formData.password.length < 8) {
      this.errors['password'] = 'La password deve contenere almeno 8 caratteri';
      isValid = false;
    }

    return isValid;
  }

  handleSubmit(ev: Event): void {
    ev.preventDefault();

    // Reset errore submit precedente
    this.submitError = '';

    if (!this.validateForm()) {
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.formData.email.trim(),
      password: this.formData.password,
    };

    this.isSubmitting = true;
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        // Salva il token
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Redirect alla dashboard o home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Errore durante il login:', error);

        if (error.status === 401) {
          this.submitError = 'Email o password non corretti.';
        } else if (error.status === 404) {
          this.submitError = 'Account non trovato. Registrati per continuare.';
        } else if (error.status === 400) {
          this.submitError = 'Dati non validi. Controlla i campi e riprova.';
        } else {
          this.submitError = 'Errore durante il login. Riprova più tardi.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
