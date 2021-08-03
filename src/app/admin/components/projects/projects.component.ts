import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';

import { Project } from '../../../core/interfaces/project';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../../core/services/admin/projects.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddProjectDialog } from '../../dialogs/add-project/add-project.dialog';

/**
 * project-admin component
 */
@Component({
  selector: 'app-admin-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['../../admin.component.scss', './projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * project list
   */
  projects: MatTableDataSource<Project>;

  /**
   * project list subscription
   */
  projectSubscription: Subscription;

  /**
   * default constructor
   * @param dialog
   * @param projectService
   */
  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
  ) {}

  /**
   * Subscribe to projects at component init
   */
  ngOnInit(): void {
    this.projectService.initializeProjects();

    this.projectSubscription = this.projectService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = new MatTableDataSource(projects);
        this.projects.sort = this.sort;
      });
  }

  /**
   * Remove project subscription when component gets destroyed
   */
  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }

  /**
   * Show new project dialog window
   */
  addProject(): void {
    this.showEditDialog(new Project());
  }

  /**
   * Show update project dialog window
   * @param id
   */
  updateProject(id: number): void {
    this.showEditDialog(this.projects.data.find((p: Project) => p.id === id));
  }

  /**
   * Switch active state of project
   * @param id
   * @param active
   */
  setProjectActiveState(id: number, active: boolean): void {
    this.projectService.setProjectActiveState(id, active);
  }

  /**
   * Opens add/edit project dialog window
   * @param project
   */
  showEditDialog(project: Project): void {
    let dialogRef: any = this.dialog.open(AddProjectDialog, {
      data: {
        project: project,
      },
    });

    dialogRef.afterClosed().subscribe((p: Project | boolean) => {
      if (p) {
        this.projectService.setProject(<Project>p);
      }
    });
  }
}
