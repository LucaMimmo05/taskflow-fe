import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { Home } from './pages/home/home';
import { ProjectsPage } from './pages/projects/projects';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'projects', component: ProjectsPage, canActivate: [authGuard] },
  {
    path: 'home',
    component: Home,
    canActivate: [authGuard],
  },
];
