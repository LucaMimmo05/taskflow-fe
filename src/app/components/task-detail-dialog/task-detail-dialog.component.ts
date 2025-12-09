import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss']
})
export class TaskDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public task: any // Using any to accommodate TaskWithProject extra fields easily
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getPriorityLabel(priority: string | undefined): string {
    if (!priority) return 'Non definita';
    const labels: { [key: string]: string } = {
      LOW: 'Bassa',
      MEDIUM: 'Media',
      HIGH: 'Alta',
    };
    return labels[priority] || priority;
  }
  
  getPriorityClass(priority: string | undefined): string {
    if (!priority) return '';
    return `priority-${priority.toLowerCase()}`;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Nessuna scadenza';
    return new Date(date).toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}
