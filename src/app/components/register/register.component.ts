import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;

  // Logo path con timestamp per evitare cache
  logoPath = `/assets/logo.png?v=${Date.now()}`;
  // Immagine laterale
  leftImagePath = `/assets/Group2.png?v=${Date.now()}`;

  // Form data
  formData = {
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Form state
  errors: { [key: string]: string } = {};
  isSubmitting = false;
  submitError = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Validazione nome
    if (!this.formData.nome || this.formData.nome.trim().length === 0) {
      this.errors['nome'] = 'Il nome è obbligatorio';
      isValid = false;
    } else if (this.formData.nome.trim().length < 2) {
      this.errors['nome'] = 'Il nome deve contenere almeno 2 caratteri';
      isValid = false;
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formData.email || this.formData.email.trim().length === 0) {
      this.errors['email'] = "L'email è obbligatoria";
      isValid = false;
    } else if (!emailRegex.test(this.formData.email)) {
      this.errors['email'] = "Inserisci un'email valida";
      isValid = false;
    }

    // Validazione password
    if (!this.formData.password || this.formData.password.length === 0) {
      this.errors['password'] = 'La password è obbligatoria';
      isValid = false;
    } else if (this.formData.password.length < 8) {
      this.errors['password'] = 'La password deve contenere almeno 8 caratteri';
      isValid = false;
    }

    // Validazione conferma password
    if (!this.formData.confirmPassword || this.formData.confirmPassword.length === 0) {
      this.errors['confirmPassword'] = 'Conferma la password';
      isValid = false;
    } else if (this.formData.password !== this.formData.confirmPassword) {
      this.errors['confirmPassword'] = 'Le password non coincidono';
      isValid = false;
    }

    return isValid;
  }

  handleSubmit(event: Event): void {
    event.preventDefault();

    // Reset errore submit precedente
    this.submitError = '';

    // Validazione
    if (!this.validateForm()) {
      return;
    }

    // Preparazione richiesta
    const userRequest: UserRequest = {
      displayName: this.formData.nome.trim(),
      email: this.formData.email.trim(),
      password: this.formData.password,
      notifyOnDue: true, // Default value
    };

    // Invio richiesta
    this.isSubmitting = true;
    this.authService.register(userRequest).subscribe({
      next: (response) => {
        // Salva il token
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Redirect alla dashboard o home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Errore durante la registrazione:', error);

        if (error.status === 409) {
          this.submitError = "Email già registrata. Prova ad accedere o usa un'altra email.";
        } else if (error.status === 400) {
          this.submitError = 'Dati non validi. Controlla i campi e riprova.';
        } else {
          this.submitError = 'Errore durante la registrazione. Riprova più tardi.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
