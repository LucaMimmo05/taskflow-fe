import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/user.model';

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
  avatarUrl: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
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

  saveProfile(): void {
    if (!this.user) return;

    const updatedUser: Partial<UserResponse> = {
      displayName: this.displayName,
      email: this.email,
      avatarUrl: this.avatarUrl,
    };

    // Qui chiameresti il servizio per aggiornare il profilo
    // this.userService.updateUser(this.user.id!, updatedUser).subscribe(...)
    
    // Per ora aggiorniamo solo il localStorage
    const updatedUserData = { ...this.user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    this.user = updatedUserData as UserResponse;
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

