import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationToastService } from '../../services/notification-toast.service';
import { UserResponse, UpdateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfilePage implements OnInit {
  user: UserResponse | null = null;
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  avatarUrl: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  isSaving = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastService: NotificationToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.displayName = this.user.displayName || '';
      this.email = this.user.email || '';
      this.avatarUrl = this.user.avatarUrl || '';
      if (this.avatarUrl) {
        this.previewUrl = this.avatarUrl;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Crea un preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    // Qui implementeresti l'upload al backend
    // Per ora simuliamo con un timeout
    setTimeout(() => {
      if (this.previewUrl) {
        this.avatarUrl = this.previewUrl;
        // Aggiorna l'utente nel localStorage
        if (this.user) {
          this.user.avatarUrl = this.avatarUrl;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }
      this.isUploading = false;
      this.selectedFile = null;
    }, 1000);
  }

  validateForm(): boolean {
    this.error = null;

    if (!this.displayName.trim()) {
      this.error = 'Il nome è obbligatorio';
      return false;
    }

    if (this.displayName.length < 3 || this.displayName.length > 30) {
      this.error = 'Il nome deve essere tra 3 e 30 caratteri';
      return false;
    }

    if (!this.email.trim()) {
      this.error = "L'email è obbligatoria";
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Email non valida';
      return false;
    }

    if (!this.password) {
      this.error = 'La password è obbligatoria';
      return false;
    }

    if (this.password.length < 8) {
      this.error = 'La password deve essere di almeno 8 caratteri';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Le password non coincidono';
      return false;
    }

    return true;
  }

  saveProfile(): void {
    if (!this.user) return;

    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    this.error = null;

    const updateRequest: UpdateUserRequest = {
      displayName: this.displayName.trim(),
      email: this.email.trim(),
      password: this.password,
      notifyOnDue: this.user.notifyOnDue
    };

    this.userService.updateProfile(updateRequest).subscribe({
      next: (updatedUser) => {
        // Update local storage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.user = updatedUser;
        this.password = '';
        this.confirmPassword = '';
        this.isSaving = false;
        this.toastService.showSuccess('Profilo aggiornato', 'Le tue informazioni sono state salvate con successo');
      },
      error: (err) => {
        console.error('Errore aggiornamento profilo:', err);
        this.isSaving = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.violations) {
          this.error = err.error.violations.map((v: any) => v.message).join(', ');
        } else {
          this.error = 'Errore durante il salvataggio del profilo';
        }
        this.toastService.showError('Errore', this.error || 'Errore sconosciuto');
      }
    });
  }

  getInitials(): string {
    if (!this.displayName) return 'U';
    return this.displayName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
