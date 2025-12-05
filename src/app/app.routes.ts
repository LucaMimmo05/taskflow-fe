import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { Home } from './pages/home/home';
import { ProjectsPage } from './pages/projects/projects';
import { ProjectDetailComponent } from './pages/projects/project-detail/project-detail';
import { CalendarPage } from './pages/calendar/calendar';
import { TasksPage } from './pages/tasks/tasks';
import { ProfilePage } from './pages/profile/profile';
import { NotificationsPage } from './pages/notifications/notifications';
import { MainLayout } from './components/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: Home },
      { path: 'projects', component: ProjectsPage },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'calendar', component: CalendarPage },
      { path: 'tasks', component: TasksPage },
      { path: 'profile', component: ProfilePage },
      { path: 'notifications', component: NotificationsPage },
    ],
  },
];
