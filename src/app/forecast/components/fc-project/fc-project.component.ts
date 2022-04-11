import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { UtilitiesService } from "../../../core/services/utilities.service";

import { FcEntry } from "../../../core/interfaces/fcEntry";
import { FcProject } from "../../../core/interfaces/fcProject";
import { Project } from "../../../core/interfaces/project";
import { Probability } from "../../../core/interfaces/probability";
import { AuthService } from "../../../core/security/auth.service";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { environment as env } from "../../../../environments/environment";
import { ConfirmMessageDialog } from "../../dialogs/confirm-message/confirm-message.dialog";
import { ProjectRequestDialog } from "../../dialogs/add-project/project-request.dialog";
import { DataSharingService } from "../../../core/shared/data-sharing.service";
import { Month } from '../../../core/interfaces/month';
/**
 * forecast-entry component
 */
@Component({
  selector: "app-fc-project",
  templateUrl: "./fc-project.component.html",
  styleUrls: ["./fc-project.component.scss"],
})
export class FcProjectComponent implements OnInit {
  @Input("forecast") forecast: FcEntry;
  @Input("project") project: FcProject;
  @Input("index") i: number;
  @Input("monthId") monthId: number;
  @Input("userId") userId: number;
  @Input("lastEditor") lastEditor: string;
  @Input("hundredPercent") hundredPercent: boolean;
  @Output() valueUpdate = new EventEmitter<boolean>();
  @Input("fiveTenFifteen") fiveTenFifteen: boolean;

  /**
   * list of all probabilities
   */
  availableProbabilities: Probability[] = [];

  /**
   * list of all projects
   */
  availableProjects: Project[] = [];

  availableMonthRange: Month[] = []

  /**
   * list of filtered projects
   */
  filteredProjects: Project[] = [];

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
    private forecastService: ForecastService,
    private dataSharingService: DataSharingService
  ) { }

  /**
   * Initializes forecast entry component.
   */
  ngOnInit(): void {
    this.projectControl = this.fb.control(
      {
        value: this.project.projectId,
        disabled:
          this.forecast.locked >= this.authService.getRoleId() ? true : false,
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
    this.initAvailableMonthRange();

  }

  initAvailableMonthRange(): void {
    this.availableMonthRange = this.utilitiesService.getMonths();
    this.availableMonthRange  = this.availableMonthRange.filter((month: Month) => month.active === true);

    var today = new Date();
    var todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.availableMonthRange =  this.availableMonthRange.filter((m: Month) => new Date(m.time) >= todayMonth);

    if (this.availableMonthRange.length > 7) {
      this.availableMonthRange = this.availableMonthRange.slice(1, 7);
    }

    this.availableMonthRange = this.availableMonthRange.filter((m: Month) => m.id >= this.monthId )
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
      this.projectControl.setValue(this.filteredProjects[0].id);
    }
    this.validateProjects();
    //this.callDataUpdate();
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

    this.forecastService.validateProjects(this.forecast);
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
    if (this.forecast.projects) {
      this.dataSharingService.setProjectInputValid(true);
      this.dataSharingService.setCorValueBiggerThanZero(true);

      for (let p of this.forecast.projects) {
        if (p.errors.length > 0) {
          this.dataSharingService.setProjectInputValid(false);
          break;
        }
      }
    }
  }

  /**
   * Removes a project from the forecast.
   * @param index
   */
  removeProjectFromForecast(index: number): void {
    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(
      ConfirmMessageDialog,
      {
        data: {
          message:
            "Are you sure you want to remove this project from the forecast?",
          button: { cancel: "Cancel", submit: "Remove" },
        },
      }
    );

    dialogRef.afterClosed().subscribe((remove: boolean) => {
      if (remove === true) {
        this.forecastService.removeProject(this.monthId, this.userId, index);
        this.setProjectInputValidness();
      }
    });
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

      if (this.hundredPercent) {
        this.setHundredPercentToProject()
        this.forecast.isHundredPercent = true;
        this.forecast.isFiveTenFifteen = false;
        this.valueUpdate.emit(this.hundredPercent = false);
      }
      if (this.fiveTenFifteen) {
        this.setFiveTenFifteenToProject()
        this.forecast.isFiveTenFifteen = true;
        this.forecast.isHundredPercent = false;
        this.valueUpdate.emit(this.fiveTenFifteen = false);
      }
    }
    this.forecast.rangeHundredPercent += 1;
    this.forecastService.setForecast(this.forecast, false, true);
    this.validateProjects();
  }

  setHundredPercentToProject(): void {
    var tempProjects = this.forecast.projects.filter(project => project.mandatory == 'Y' || project.projectId == this.project.projectId);
    tempProjects.forEach(function (entry) {

      entry.probabilityId = 1
      if (entry.projectId == 317) {
        entry.plannedProjectDays = 1
      }
      else {
        entry.plannedProjectDays = 0
      }
    })
    this.forecast.projects = tempProjects;
    this.project.plannedProjectDays = this.forecast.totalDays - 1;
    this.project.probabilityId = 1;

  }

  setFiveTenFifteenToProject(): void {

    var tempProjects = this.forecast.projects.filter(project => project.mandatory == 'Y' || project.projectId == this.project.projectId);
    var benchdays = this.forecast.totalDays - 5;
    tempProjects.forEach(function (entry) {
      entry.probabilityId = 1
      if (entry.projectId == 317) {
        entry.plannedProjectDays = benchdays;
      }
      else {
        entry.plannedProjectDays = 0
      }
    })
    this.forecast.projects = tempProjects;
    this.project.plannedProjectDays = 5;
    this.project.probabilityId = 1;

  }
  switchBillable(): string {
    if (this.project.billable) {
      if (this.project.billable.valueOf()) {
        return "Switch to Non-Billable";
      }
    }

    return "Switch to Billable";
  }

  /**
   * Loads the history data of a specific forecast
   *
   * @param attribute
   * @param index
   */
  history(attribute: string, index: number): string | boolean {
    if (
      this.forecast.history &&
      this.forecast.history.length > 0 &&
      this.forecast.history[0].projects.length > index
    ) {
      if (
        attribute === "days" &&
        this.forecast.history[0].projects[index].plannedProjectDays
      ) {
        return (
          this.lastEditor +
          ": " +
          this.forecast.history[0].projects[index].plannedProjectDays +
          " days"
        );
      } else if (
        attribute === "cor" &&
        this.forecast.history[0].projects[index].cor
      ) {
        return (
          this.lastEditor +
          ": € " +
          this.forecast.history[0].projects[index].cor
        );
      } else if (attribute === "probabilityId") {
        return (
          this.lastEditor +
          ": " +
          this.availableProbabilities.find(
            (p: Probability) =>
              p.id === this.forecast.history[0].projects[index].probabilityId
          ).name
        );
      }
    } else if (this.forecast.createdAt && this.forecast.changedBy) {
      if (
        attribute === "days" &&
        this.forecast.projects[index].plannedProjectDays
      ) {
        return (
          this.lastEditor +
          ": " +
          this.forecast.projects[index].plannedProjectDays +
          " days"
        );
      } else if (attribute === "cor" && this.forecast.projects[index].cor) {
        return this.lastEditor + ": € " + this.forecast.projects[index].cor;
      } else if (
        attribute === "probabilityId" &&
        this.forecast.projects[index].probabilityId
      ) {
        return (
          this.lastEditor +
          ": " +
          this.availableProbabilities.find(
            (p: Probability) =>
              p.id === this.forecast.projects[index].probabilityId
          ).name
        );
      }
    }

    return false;
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
   * Returns whether the logged in user has a lead role
   */
  hasLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pdl);
  }

  hasPLRole(): boolean {
    return this.authService.hasRole(env.roles.pl);
  }

  /**
   * Tests if a COR value has already been entered
   * @param cor
   */
  hasCORValue(cor: number): boolean {
    if (typeof cor !== "undefined") {
      return true;
    }

    return false;
  }

  checkCORValueBiggerThanZero(): void {
    if (this.project.billable && this.hasLeadRole()) {
      if (this.project.cor > 0) {
        this.dataSharingService.setCorValueBiggerThanZero(true);
      } else {
        this.dataSharingService.setCorValueBiggerThanZero(false);
      }
    } else if (!this.project.billable && this.hasLeadRole()) {
      this.dataSharingService.setCorValueBiggerThanZero(true);
    } else if (!this.hasLeadRole()) {
      this.dataSharingService.setCorValueBiggerThanZero(true);
    }
  }

  /**
   * Tests if a project is mandatory
   * @param projectId
   */
  isMandatory(projectId: number): boolean {
    return this.availableProjects.find(
      (p: Project) => p.mandatory === "Y" && p.id === projectId
    )
      ? true
      : false;
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
    if (this.forecast && this.forecast.locked >= this.authService.getRoleId()) {
      return true;
    }
    return false;
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
