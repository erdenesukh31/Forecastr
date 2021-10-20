import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { UtilitiesService } from "../../../core/services/utilities.service";

import { FcEntry } from "../../../core/interfaces/fcEntry";
import { FcProject } from "../../../core/interfaces/fcProject";
import { Project } from "../../../core/interfaces/project";
import { AuthService } from "../../../core/security/auth.service";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { ProjectRequestDialog } from "../../dialogs/add-project/project-request.dialog";
import { DataSharingService } from "../../../core/shared/data-sharing.service";
import { SubCoForecastService } from "../../../core/services/subCoForecast.service";
import { SubCoDetails } from "../../../core/interfaces/subCoDetails";
import { Probability } from "../../../core/interfaces/probability";

/**
 * forecast-entry component
 */
@Component({
  selector: "app-subco-fc-project",
  templateUrl: "./subco-fc-project.component.html",
  styleUrls: ["./subco-fc-project.component.scss"],
})
export class SubcoFcProjectComponent implements OnInit {
  @Input("subCoDetails") subcoDetails: SubCoDetails;
  @Input("project") project: FcProject;
  @Input("monthId") monthId: number;
  @Input("subcoId") subcoId: number;
  @Input("lastEditor") lastEditor: string;

  /**
   * list of all projects
   */
  availableProjects: Project[] = [];

  /**
   * list of filtered projects
   */
  filteredProjects: Project[] = [];

  /**
   * list of available probabilities
   */
  availableProbabilities: Probability[] = [];


  /**
   * projectcontrol attribute for angular material autocomplete
   */
  projectControl: FormControl = new FormControl();

  /**
   * forecast-entry component constructor
   * @param dialog
   * @param fb
   * @param authService
   * @param utilitiesService
   * @param forecastService
   */
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private utilitiesService: UtilitiesService,
    private subcoForecastService: SubCoForecastService,
    private dataSharingService: DataSharingService
  ) {}

  /**
   * Initializes forecast entry component.
   */
  ngOnInit(): void {
    this.projectControl = this.fb.control(
      {
        value: this.subcoDetails.projectId,
        disabled: 
            this.subcoDetails.lockState === 'LoackedState1'
      },
      Validators.required
    );
  
    this.availableProjects = this.utilitiesService.getProjects();
    this.filteredProjects = this.availableProjects.filter(
      (p: Project) => p.active === true
    );
    this.availableProbabilities = this.utilitiesService.getProbabilities();

    this.dataSharingService.setProjectInputValid(true);
    this.validateProjects();
    this.checkCORValueBiggerThanZero();
  }

  /**
   * apply filter method for material autocomplete to only show filtered values
   * @param value
   */
  applyFilter(value: string): void {
    const filteredValue: string = value.toLowerCase();
    this.filteredProjects = this.availableProjects.filter(
      (p: Project) =>
        p.active === true && p.name.toLowerCase().includes(filteredValue)
    );
  }

  onProjectInputFocus(): void {
    this.dataSharingService.setProjectInputFocus(true);
  }

  onProjectInputBlur(): void {
    this.dataSharingService.setProjectInputFocus(false);

    if (this.filteredProjects.length === 1) {
      debugger;
      this.projectControl.setValue(this.filteredProjects[0].id);
    }
    this.validateProjects();
  //  this.callDataUpdate();

  }
  validateProjects(): void {
    if (!this.project.projectId) {
      for (let p of this.availableProjects) {
        if (p.id === this.projectControl.value) {
          this.project.projectId = p.id;
          break;
        }
      }
    }

    this.subcoForecastService.validateProjects(this.subcoDetails);
    this.setProjectInputValidness();
    this.checkCORValueBiggerThanZero();
  }
  onProjectDaysBlur(event: any): void {
    if (event.target.value === "") {
      this.project.plannedProjectDays = 0;
    }
    this.validateProjects();
  }

  /**
   * display project name by id method for material autocomplete
   * @param projectId
   */
  displayProjectName(projectId?: number): string {
    return projectId ? this.projectName(projectId) : "";
  }

  setProjectInputValidness(): void {
    if (this.subcoDetails.projectId) {
      this.dataSharingService.setProjectInputValid(true);
      this.dataSharingService.setCorValueBiggerThanZero(true);
    }

    if (this.subcoDetails.errors.length > 0) {
      this.dataSharingService.setProjectInputValid(false);
    }
  }

  /**
   * Removes projectId when Autocomplete panel is opened
   */
  clearProjectId(): void {
    this.project.projectId = undefined;
  }

  /**
   * Passes updated data to the summary
   */
  callDataUpdate(): void {
    if (this.project.projectId !== this.projectControl.value) {
      this.project.projectId =
        this.projectControl.value === ""
          ? undefined
          : this.projectControl.value;

      let project: Project = this.availableProjects.find(
        (p: Project) => p.id === this.project.projectId
      );
      this.project.projectId = project === undefined ? undefined : project.id;

      this.project.billable =
        project && typeof project.billable !== "undefined"
          ? project.billable
          : true;
      if (project && project.projectType >= 1 && project.projectType <= 5) {
        this.project.cor = 0;
        this.project.externalRevenue = false;
      }
    }

    this.project.cor = this.subcoDetails.cor;
    this.subcoDetails.projectId = this.project.projectId;
    this.subcoForecastService.setForecast(this.subcoDetails, false, true);
    this.validateProjects();
  }

  /**
   * Returns the name of a project.
   * @param id
   */
  projectName(id: number): string {
    let project: Project = this.availableProjects.find(
      (p: Project) => p.id === id
    );
    return project ? project.name : "";
  }

  /**
   * Tests if a project is automatically set as internal
   * @param projectId
   */
  isFixedInternal(projectId: number): boolean {
    return this.availableProjects.find(
      (p: Project) => p.projectType > 0 && p.id === projectId
    )
      ? true
      : false;
  }

  /**
   * Test is forecast is locked for logged-in user
   */
  fcIsLocked(): boolean {
    if (this.subcoDetails && this.subcoDetails.lockState !== 'Unlocked') {
      return true;
    }
    return false;
  }
  addProjectMail() {
    let dialogRef: MatDialogRef<ProjectRequestDialog> = this.dialog.open(
      ProjectRequestDialog,
      {
        data: {
          width: "30%",
          maxHeight: "20%",
        },
      }
    );
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  checkCORValueBiggerThanZero(): void {
    if (this.project.billable) {
      if (this.project.cor > 0) {
        this.dataSharingService.setCorValueBiggerThanZero(true);
      } else {
        this.dataSharingService.setCorValueBiggerThanZero(false);
      }
    } else if (!this.project.billable ) {
      this.dataSharingService.setCorValueBiggerThanZero(true);
    }
  }

  /**
   * Turns an error test into a css class
   * @param errtext - the text of the error
   */
  toErrorClass(errtext): string {
    let result = errtext.toLowerCase().split(".").join("");
    return result.replace(/\s/gi, "-");
  }
}


