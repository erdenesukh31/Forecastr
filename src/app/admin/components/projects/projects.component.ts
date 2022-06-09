import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';

import { Project } from '../../../core/interfaces/project';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../../core/services/admin/projects.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AddProjectDialog } from '../../dialogs/add-project/add-project.dialog';
import { FormControl } from '@angular/forms';

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

  // Filter Projects
  mandatoryFilter = new FormControl('');
  billableFilter = new FormControl('');
  typeFilter = new FormControl('');
  searchFilter: String = " ";
  filterValues : any = {
    name:'', // name or code of the project
    mandatory: null,
    billable: null,
    type: []
  }
  /**
   * Subscribe to projects at component init
   */
  ngOnInit(): void {
    this.projectService.initializeProjects();

    this.projectSubscription = this.projectService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = new MatTableDataSource(projects);
        this.projects.sort = this.sort;
        this.projects.sortingDataAccessor = (data, attribute) => data[attribute];
        this.projects.filterPredicate = this.createFilter();
        this.applyFilter(this.filterValues.name);
      });
      this.fieldListener();

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

  //Filter logic
  applyFilter(filterValue) {
    this.filterValues.name = filterValue.trim().toLowerCase();
    this.projects.filter = JSON.stringify(this.filterValues);

  }
  private fieldListener() {
    this.mandatoryFilter.valueChanges
      .subscribe(
        isMandatory => {
          this.filterValues.mandatory = isMandatory;
          this.projects.filter = JSON.stringify(this.filterValues);
        }
      )
    this.billableFilter.valueChanges
      .subscribe(
        isBillable => {
          this.filterValues.billable = isBillable;
          this.projects.filter = JSON.stringify(this.filterValues);
        }
      )
    this.typeFilter.valueChanges
      .subscribe(
        type => {
          this.filterValues.type = type;
          this.projects.filter = JSON.stringify(this.filterValues);
        }
      )
  }

   // custom filter to overwrite the filter predicate
   private createFilter(){
    const filterFunction = function (project: Project, filter): boolean {
      
      let match = true;
      let matchType = false;

      let searchTerms = JSON.parse(filter);

      if(searchTerms.name){
        return (project.code.toLowerCase() + project.name.toLowerCase()).split(' ').join('')
        .includes(searchTerms.name);
      } 
      if(searchTerms.mandatory !=null){
       match = match && project.mandatory == searchTerms.mandatory;
      }
      if(searchTerms.billable != null){
        match = match && project.billable == searchTerms.billable;
      }
      if(searchTerms.type.length>0){
      searchTerms.type.forEach(element => {
          if(element != null)
          matchType = matchType || project.projectType == element;
        }); 
        match = match && (matchType);
      }
      return match;
    }

    return filterFunction;
  }

  clearFilter(){
    this.searchFilter = "";
    this.filterValues.name =  this.searchFilter;
    this.mandatoryFilter.setValue(null);
    this.billableFilter.setValue(null);
    this.typeFilter.setValue([]);
  }
}
