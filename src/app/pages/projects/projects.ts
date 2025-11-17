import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { FormsModule } from '@angular/forms';

interface NewPhaseForm {
  id: string;
  title: string;
  position: number;
}

interface NewLabelForm {
  id: string;
  title: string;
  color: string;
}

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class ProjectsPage implements OnInit {
  projects: Project[] = [];
  loading = true;
  error: string | null = null;

  // Modal state
  showCreateModal = false;
  creating = false;

  // Form state
  projectTitle = '';
  phases: NewPhaseForm[] = [this.makePhase('To Do', 0)];
  labels: NewLabelForm[] = [];

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => { this.projects = data; this.loading = false; },
      error: (err) => { this.error = 'Errore nel caricamento progetti'; this.loading = false; console.error(err); }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    if (this.creating) return;
    this.showCreateModal = false;
  }

  addPhase(): void {
    if (this.phases.length >= 3) return;
    this.phases.push(this.makePhase('', this.phases.length));
  }

  removePhase(index: number): void {
    this.phases.splice(index, 1);
    // Recompute positions
    this.phases.forEach((p, i) => p.position = i);
  }

  addLabel(): void {
    this.labels.push({ id: this.genId('lbl'), title: '', color: '#6C63FF' });
  }

  removeLabel(index: number): void {
    this.labels.splice(index, 1);
  }

  submitCreate(): void {
    this.error = null;
    if (!this.projectTitle.trim()) { this.error = 'Titolo obbligatorio'; return; }
    if (this.phases.length === 0) { this.error = 'Almeno una fase necessaria'; return; }
    if (this.phases.some(p => !p.title.trim())) { this.error = 'Tutte le fasi devono avere un titolo'; return; }

    const request = {
      title: this.projectTitle.trim(),
      phases: this.phases.map(p => ({ id: p.id, title: p.title.trim(), position: p.position })),
      labels: this.labels.filter(l => l.title.trim()).map(l => ({ id: l.id, title: l.title.trim(), color: l.color }))
    };

    this.creating = true;
    this.projectService.createProject(request).subscribe({
      next: (created) => {
        this.projects.push(created);
        this.creating = false;
        this.showCreateModal = false;
      },
      error: (err) => { this.error = 'Errore creazione progetto'; this.creating = false; console.error(err); }
    });
  }

  goToProject(project: Project): void {
    this.router.navigate(['/project', project.id]);
  }

  private resetForm(): void {
    this.projectTitle = '';
    this.phases = [this.makePhase('To Do', 0)];
    this.labels = [];
    this.error = null;
    this.creating = false;
  }

  private makePhase(title: string, position: number): NewPhaseForm {
    return { id: this.genId('ph'), title, position };
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  }
}
