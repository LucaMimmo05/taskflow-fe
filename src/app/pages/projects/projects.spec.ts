import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsPage } from './projects';
import { ProjectService } from '../../services/project.service';
import { of } from 'rxjs';

class MockProjectService {
  getProjects() { return of([]); }
  createProject() { return of(); }
}

describe('ProjectsPage', () => {
  let component: ProjectsPage;
  let fixture: ComponentFixture<ProjectsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPage],
      providers: [ { provide: ProjectService, useClass: MockProjectService } ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
