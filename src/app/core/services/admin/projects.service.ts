import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

import { Project } from '../../interfaces/project';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { PageStateService } from '../../shared/page-state.service';

/**
 * projects service
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  /**
   * Observable which contains all projects
   */
  projects$: BehaviorSubject<Project[]>;

  /**
   * utilities service constructor
   * 
   * @param http
   * @param BO
   * @param spinner
   */
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    private pageState: PageStateService,
  ) {
    this.projects$ = new BehaviorSubject([]);
  }

  /**
   * Initializes projects
   */
  initializeProjects(): void {
    this.http.get(this.BO.getAdminProjects()).subscribe((projects: Project[]) => {
      this.projects$.next(projects.sort((a, b) => (b.mandatory === 'Y') ? 1 : -1));
    });
  }

  addProject(project: Project): void {
    let projects: Project[] = this.projects$.getValue();
    projects = projects.filter((p: Project) => p.id !== project.id);
    projects.push(project);
    this.projects$.next(projects);
  }

  /**
   * Empties project-data
   * Typically called at logout
   */
  reset(): void {
    this.projects$.next([]);
  }

  /**
   * returns all projects
   */
  getProjects(): Project[] {
    return this.projects$.getValue();
  }

	/**
	 * 
	 */
  setProject(project: Project): void {
    this.http.put(this.BO.setProject(), project)
      .subscribe((p: Project) => {
        this.addProject(p);
        this.snackBar.open('Project successfully saved!', 'OK', { duration: 5000, });
        this.pageState.hideSpinner();

      }, (e: any) => {
        this.snackBar.open('Project could not be saved!', 'OK', { duration: 10000, });
        this.pageState.hideSpinner();

      });
  }

  setProjectActiveState(id: number, state: boolean): void {
    this.http.put(this.BO.setProjectState(), {id: id, active: state })
      .subscribe((p: Project) => {
        this.addProject(p);
      });
  }
}
