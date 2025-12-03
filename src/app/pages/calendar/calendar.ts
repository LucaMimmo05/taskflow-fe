import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { forkJoin } from 'rxjs';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarPage implements OnInit {
  currentDate = new Date();
  currentMonth: Date = new Date();
  calendar: CalendarWeek[] = [];
  weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  projects: Project[] = [];
  allTasks: Task[] = [];
  loading = true;
  error: string | null = null;

  // Selected day modal
  selectedDay: CalendarDay | null = null;
  showDayModal = false;

  // Task detail modal
  selectedTask: Task | null = null;
  selectedTaskProject: Project | null = null;
  showTaskModal = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loadAllTasks();
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dei progetti';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadAllTasks(): void {
    if (this.projects.length === 0) {
      this.allTasks = [];
      this.generateCalendar();
      this.loading = false;
      return;
    }

    const taskRequests = this.projects.map((p) => this.taskService.getTasksByProject(p.id));
    forkJoin(taskRequests).subscribe({
      next: (results) => {
        this.allTasks = results.flat();
        this.generateCalendar();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento task:', err);
        this.allTasks = [];
        this.generateCalendar();
        this.loading = false;
      },
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the first Monday to show (might be from previous month)
    let startDate = new Date(firstDayOfMonth);
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Get the last Sunday to show (might be from next month)
    let endDate = new Date(lastDayOfMonth);
    const lastDayOfWeek = endDate.getDay();
    const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(endDate.getDate() + daysToAdd);

    const calendar: CalendarWeek[] = [];
    let currentWeek: CalendarDay[] = [];
    const currentDateLoop = new Date(startDate);

    while (currentDateLoop <= endDate) {
      const day: CalendarDay = {
        date: new Date(currentDateLoop),
        day: currentDateLoop.getDate(),
        isCurrentMonth: currentDateLoop.getMonth() === month,
        isToday: this.isSameDay(currentDateLoop, this.currentDate),
        tasks: this.getTasksForDate(currentDateLoop),
      };

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        calendar.push({ days: currentWeek });
        currentWeek = [];
      }

      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
    }

    this.calendar = calendar;
  }

  getTasksForDate(date: Date): Task[] {
    const dateStr = this.formatDateForComparison(date);
    return this.allTasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.substring(0, 10) === dateStr;
    });
  }

  formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  get monthYearLabel(): string {
    return this.currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  }

  // Day Modal
  openDayModal(day: CalendarDay): void {
    this.selectedDay = day;
    this.showDayModal = true;
  }

  closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDay = null;
  }

  // Task Detail
  openTaskDetail(task: Task, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedTask = task;
    this.selectedTaskProject = this.projects.find((p) => p.id === task.projectId) || null;
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.selectedTask = null;
    this.selectedTaskProject = null;
  }

  goToProject(projectId: string): void {
    this.closeTaskModal();
    this.closeDayModal();
    this.router.navigate(['/projects', projectId]);
  }

  getProjectForTask(task: Task): Project | undefined {
    return this.projects.find((p) => p.id === task.projectId);
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date(this.formatDateForComparison(this.currentDate));
  }

  formatDueDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }
}
