import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FcProject } from '../../interfaces/fcProject';
import { Project } from '../../interfaces/project';
import { FcEntry } from '../../interfaces/fcEntry';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { Month } from '../../interfaces/month';
import { UtilitiesService } from '../utilities.service';
import { AuthService } from '../../security/auth.service';
import { PageStateService } from '../../shared/page-state.service';
import { UserService } from '../user.service';
import { User } from '../../interfaces/user';
import { environment as env } from '../../../../environments/environment.prod';
import { TeamUserService } from './team-user.service';
import { cloneDeep } from 'lodash';
import { DataSharingService } from '../../shared/data-sharing.service';
import { Router } from '@angular/router';
import { Suggestion } from '../../interfaces/suggestion';
import { resolve } from 'url';

/**
 * forecast service
 */
@Injectable({
  providedIn: 'root',
})
export class ForecastService {
  /**
   * observable which returns all available forecasts which have already been loaded from the server
   */
  forecasts$: BehaviorSubject<FcEntry[]>;

  /**
   * contains all available forecasts which have already been loaded from the server
   */
  forecasts: FcEntry[];

  /**
   * contains all projects
   */
  projects: Project[];

  /**
   * contains all months
   */
  months: Month[];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    private utilitiesService: UtilitiesService,
    private authService: AuthService,
    private pageState: PageStateService,
    private userService: UserService,
    private teamService: TeamUserService,
    private dataSharingService: DataSharingService,
    private router: Router,
  ) {
    this.forecasts = [];
    this.forecasts$ = new BehaviorSubject([]);

    this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;

        this.forecasts.forEach((forecast: FcEntry) => {
          forecast.projects = this.addMandatoryProjects(forecast.projects);
        });
        this.forecasts$.next(this.forecasts);
      });

    this.utilitiesService.months$
      .subscribe((months: Month[]) => {
        this.months = months;
      });
    
  }

  /**
   * adds new forecasts
   * monthId can be used if new placeholder forecasts need to be added 
   * to the service forecast cache if e.g. copying data from last month
   * @param forecasts
   * @param loadHistory
   */
  addForecasts(forecasts: FcEntry[], loadHistory: boolean = false, monthId: number = 0): void {
    forecasts.forEach((forecast: FcEntry) => {
      if(forecast && forecast.forecastId >= 0){
        this.setForecast(forecast, loadHistory, false);

      } else {
        //create new Placeholder
        this.createNewForecast(forecast.userId, monthId);
      }
    });
  }

  /**
   * Sets forecast data
   * @param forecast
   * @param loadHistory
   */
  setForecast(forecast: FcEntry, loadHistory: boolean, updated: boolean = false): void {
    if (!forecast.userId || !forecast.monthId) {
      return;
    }

    let mandatoryProjects: FcProject[] = forecast.projects.filter((p: FcProject) => p.mandatory === 'Y');
    let nonmandatoryProjects: FcProject[] = forecast.projects.filter((p: FcProject) => p.mandatory !== 'Y');
    if (this.forecasts.find((fc: FcEntry) => fc.userId === forecast.userId && fc.monthId === forecast.monthId)) {
      this.forecasts
        .filter((fc: FcEntry) => fc.userId === forecast.userId && fc.monthId === forecast.monthId)
        .forEach((fc: FcEntry) => {
          fc.forecastId = forecast.forecastId;
          if (typeof forecast.locked !== 'number') {
            fc.locked = forecast.locked === true ? this.authService.getRoleId() : -1;
          } else {
            fc.locked = forecast.locked;
          }
          fc.comment = forecast.comment;
          fc.fte = forecast.fte //? forecast.fte : 1; 
          fc.ros = forecast.ros;
          fc.cor = forecast.cor;
          fc.gradeId = forecast.gradeId;
          fc.isRelevant = forecast.isRelevant;
          fc.projects = mandatoryProjects;
          fc.updated = updated;

          // Adds all mandatory projects which are not already set
          if (fc.locked <= this.authService.getRoleId()) {
            fc.projects = this.addMandatoryProjects(fc.projects);
          }

          // Adds all non-mandatory projects which have been set
          fc.projects = [...fc.projects, ...nonmandatoryProjects];

          // Calculates summary values
          fc = this.calculateValues(fc);

          // Validates entries if there has already been an invalid validation before
          if (forecast.instantValidation) {
            fc.instantValidation = forecast.instantValidation;
            fc = this.validateProjects(fc);
          }
        });
    } else {
      if (typeof forecast.locked !== 'number') {
        forecast.locked = forecast.locked === true ? this.authService.getRoleId() : -1;
      }
      forecast.projects = mandatoryProjects;

      if (!forecast.gradeId || forecast.gradeId === 0) {
        let u: User = this.userService.getUser(forecast.userId);
        forecast.gradeId = u ? u.gradeId : 0;
      }

      if (forecast.locked <= this.authService.getRoleId()) {
        forecast.projects = this.addMandatoryProjects(forecast.projects);
      }
      forecast.projects = [...forecast.projects, ...nonmandatoryProjects];

      forecast = this.calculateValues(forecast);

      this.forecasts.push(forecast);
    }

    // If history is not set or outdated: reload history
    if (forecast.forecastId && (!forecast.history || loadHistory)) {
      this.loadForecastHistory(forecast.forecastId)
      .then((fcHistory: FcEntry[]) => {
        this.setForecastHistory(forecast.userId, forecast.monthId, fcHistory ? fcHistory : []);
      });
    }

    this.forecasts$.next(this.forecasts);
  }

  /**
   * Adds the forecast history to a single forecast
   * @param userId
   * @param monthId
   * @param fcHistory
   */
  setForecastHistory(userId: number, monthId: number, fcHistory: FcEntry[]): void {
    this.forecasts
      .filter((fc: FcEntry) => fc.userId === userId && fc.monthId === monthId)
      .forEach((fcEntry: FcEntry) => {
        fcEntry.history = fcHistory;
      });

    this.forecasts$.next(this.forecasts);
  }

  /**
   * Sets the comment of a forecast
   * @param monthId
   * @param userId
   * @param comment
   */
  setForecastComment(monthId: number, userId: number, comment: string): void {
    this.forecasts
      .filter((fc: FcEntry) => fc.userId === userId && fc.monthId === monthId)
      .forEach((fc: FcEntry) => {
        fc.comment = comment;
        fc.updated = true;
      });
  }

  /**
   * Load a forecast from the server
   * @param userId
   * @param monthId
   */
  loadForecast(userId: number, monthId: number): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      this.http.get<FcEntry>(this.BO.forecast(userId, monthId)).subscribe(
        (fcEntry: any) => {
          if (fcEntry && (<FcEntry>fcEntry).forecastId >= 0) {
            this.setForecast(fcEntry, false, false);
            resolve({showDialog: false});

          } else {
            this.createNewForecast(userId, monthId);

            if (fcEntry && fcEntry.suggestedData) {
              resolve({showDialog: true, suggestedData: fcEntry.suggestedData });
            } else {
              resolve({showDialog: false });
            }
          }
        });
    });
  }

  createNewForecast(userId: number, monthId: number): void {
    let forecast: FcEntry = new FcEntry();
    forecast.monthId = monthId;
    forecast.userId = userId;
    forecast.fte = 0;
    let u: User = this.userService.getUser(userId);
    forecast.gradeId = u ? u.gradeId : 0;

    if (u.gradeId === 7) {
      forecast.isRelevant = false;
    }

    this.setForecast(forecast, false, false);
  }

  addProjectsToForecast(userId: number, monthId: number, suggestedData: any): void {
    this.forecasts.filter((fc: FcEntry) => fc.userId === userId && fc.monthId === monthId).forEach((fc: FcEntry) => {
      if (suggestedData.projects && (<Suggestion[]>suggestedData.projects).length > 0) {
        suggestedData.projects.forEach((suggestion: Suggestion) => {
          let fcProject: FcProject = new FcProject();
          fcProject.projectId = suggestion.projectId;
          
          if (this.projects.find((p: Project) => p.id === suggestion.projectId && p.projectType !== 0)) {
            fcProject.billable = false;
            fcProject.externalRevenue = false;
          } else {
            fcProject.billable = suggestion.billable;
            fcProject.externalRevenue = suggestion.externalRevenue;
            fcProject.cor = suggestion.cor;
            fcProject.probabilityId = suggestion.probabilityId;
          }

          this.addProject(monthId, userId, fcProject);
        });
      }

      if (suggestedData.gradeId) {
        fc.gradeId = suggestedData.gradeId;
      }

      if (suggestedData.fte) {
        fc.fte = suggestedData.fte;
      }
    });

    this.forecasts$.next(this.forecasts);
  }

  /**
   * Load the history of a forecast from the server
   * @param forecastId
   */
  loadForecastHistory(forecastId: number): Promise<FcEntry[]> {
    return new Promise((resolve: any, reject: any) => {

      this.http.get<FcEntry[]>(this.BO.forecastHistory(forecastId)).subscribe(
        (fcEntries: FcEntry[]) => {
          resolve(fcEntries);
        }, (e: any) => {
          reject([]);
        });
    });
  }

  /**
   * Saves a forecast for a specific month
   * If submit param is set to true: Forecast gets locked
   * @param monthId
   * @param userId
   * @param submit
   */
  saveForecast(monthId: number, userId: number, submit: boolean = false): void {
    let forecast: FcEntry = cloneDeep(this.forecasts.find((fc: FcEntry) => fc.userId === userId && fc.monthId === monthId));
    if (!forecast) {
      return;
    }

    forecast = this.validateProjects(forecast);
    if (([].concat.apply([], forecast.projects.map((p: FcProject) => p.errors))).length > 0) {
      forecast.instantValidation = true;
      this.setForecast(forecast, false, true);

      this.snackBar.open('Forecast cannot be saved due to one or more invalid data fields.', 'OK', { duration: 5000, });
      return;
    }

    if (submit) {
      forecast.locked = true;
    } else {
      forecast.locked = false;
    }

    forecast.history = undefined;

    this.pageState.showSpinner();
    
    this.http.put(this.BO.forecast(userId, monthId), forecast)
      .subscribe((fc: FcEntry) => {
        this.setForecast(fc, true, false);
        if(!submit) {
          this.snackBar.open('Your forecast has been successfully saved.', 'OK', { duration: 5000, });
        }
        else {
          this.snackBar.open('Your forecast has been successfully submitted.', 'OK', { duration: 5000, });
        }
        
        this.pageState.hideSpinner();

      }, (e: any) => {
        if(e.status === 409) {
          if(!this.hasLeadRole()) {
            this.snackBar.open('Your forecast has already been submitted by your team lead. Please contact your supervisor. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          }
          else {
            this.snackBar.open('The forecast has already been submitted by your colleague. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          }

          setTimeout(() => window.location.reload(), 5000);
          
        }
        else {
          if(!submit) {
            this.snackBar.open('Your forecast could not be saved. Please try again later.', 'OK', { duration: 10000, });
          }
          else if(submit){
            this.snackBar.open('Your forecast could not be submitted. Please try again later.', 'OK', { duration: 10000, });
          }
        }
        this.pageState.hideSpinner();

      });
  }

  /**
   * Unlocks a forecast: only possible for teamleads
   */
  unlockForecast(monthId: number, userId: number): void {
    this.http.put(this.BO.unlockForecast(userId, monthId), {})
      .subscribe((forecast: FcEntry) => {

        this.forecasts
          .filter((fc: FcEntry) => fc.userId === userId && fc.monthId === monthId)
          .forEach((fc: FcEntry) => {
            fc.locked = -1;
          });
        this.forecasts$.next(this.forecasts);
        this.snackBar.open('Forecast has sucessfuly been unlocked', 'OK', { duration: 10000, });
        this.pageState.hideSpinner();
      }, (e: any) => {
        this.snackBar.open('Your forecast could not be unlocked. Please try again later.', 'OK', { duration: 10000, });
        this.pageState.hideSpinner();

      });
  }

  setTeamLockState(monthId: number, level: number, lockState: number): void {
    const parentId: number = this.authService.getUserId();
    let user: number[] = this.teamService.getTeamChilds(level, parentId);

    this.forecasts
      .filter((fc: FcEntry) => fc.monthId === monthId && user.indexOf(fc.userId) >= 0)
      .forEach((fc: FcEntry) => {
        fc.locked = lockState;
      });
  }

  /**
   * Test if an available project is mandatory and has not been added to the forecast-projects yet
   * If it has not been added yet: adds it to projects
   * @param fcProjects
   */
  addMandatoryProjects(fcProjects: FcProject[]): FcProject[] {
    let mandatory: number[] = this.projects.filter((p: Project) => p.active === true && p.mandatory === 'Y').map((p: Project) => p.id);

    mandatory.forEach((mp: number) => {
      if (!fcProjects.find((p: FcProject) => p.projectId === mp)) {
        fcProjects.push({ projectId: mp, plannedProjectDays: 0, probabilityId: null, cor: 0, externalRevenue: false, mandatory: 'Y' });
      }
    });

    return fcProjects;
  }

  /**
   * Add a project to a forecast entry
   * @param monthId
   * @param userId
   * @param fcProject
   */
  addProject(monthId: number, userId: number, fcProject: FcProject): void {
    this.forecasts
      .filter((fc: FcEntry) => fc.monthId === monthId && fc.userId === userId)
      .forEach((fc: FcEntry) => {
        fc.projects = fc.projects.filter((p: FcProject) => p.projectId !== fcProject.projectId);
        fc.projects.push(fcProject);
      });

    this.forecasts$.next(this.forecasts);
  }

  /**
   * Remove a project from a forecast entry
   * @param monthId
   * @param userId
   * @param index
   */
  removeProject(monthId: number, userId: number, index: number): void {
    this.forecasts
      .filter((fc: FcEntry) => fc.monthId === monthId && fc.userId === userId)
      .forEach((fc: FcEntry) => {
        fc.projects.splice(index, 1);
        fc = this.calculateValues(fc);
      });

    this.forecasts$.next(this.forecasts);
  }

  /**
   * Calculate values: billable days, nonbillable days, projectDays, businessDays, vacationDays, arve, urve
   * @param forecast
   */
  calculateValues(forecast: FcEntry): FcEntry {
    var user = this.userService.getUser(forecast.userId);
    forecast.totalDays = this.months.find((m: Month) => m.id === forecast.monthId) ? parseInt(this.months.find((m: Month) => m.id === forecast.monthId).workingdays, 10) : 0;

    if (forecast.fte) {
      forecast.totalDays *= forecast.fte;
    } else {
      forecast.totalDays = 0;
    }

    // calculate billable + non-billable days
    forecast.billableDays = 0;
    forecast.nonbillableDays = 0;
    forecast.nonbillableProjectDays = 0;

    forecast.projects.forEach((p: FcProject) => {
      if (p.billable) {
        forecast.billableDays += (p.plannedProjectDays ? p.plannedProjectDays : 0 );
      } else {
        forecast.nonbillableDays += (p.plannedProjectDays ? p.plannedProjectDays : 0 );
        let project: Project = this.projects.find((pr: Project) => pr.id === p.projectId);
        if(project && (project.projectType === 0 || project.projectType === 5)) {
          forecast.nonbillableProjectDays += (p.plannedProjectDays ? p.plannedProjectDays : 0 );
        }
      }
    });

    // Calculate total project days (without vacation + business-development days)
    forecast.projectDays = 0;
    forecast.projects
      .filter((p: FcProject) => this.projects.find((ap: Project) => ap.projectType === 0 && ap.id === p.projectId))
      .forEach((p: FcProject) => forecast.projectDays += (p.plannedProjectDays ? p.plannedProjectDays : 0));

    forecast.businessDays = 0;
    forecast.vacationDays = 0;
    if (this.projects.length > 0 && forecast.projects.length > 0) {

      // Calculate vacation days
      let vacationProject: Project = this.projects.find((ap: Project) => ap.projectType === 3);
      if (vacationProject) {0
        let project: FcProject = forecast.projects.find((p: FcProject) => p.projectId === vacationProject.id);
        if (project && project.plannedProjectDays) {
          forecast.vacationDays = project.plannedProjectDays;
        }
      }

      // Calculate business development days
      let businessProject: Project = this.projects.find((ap: Project) => ap.projectType === 1);
      if (businessProject) {
        let project: FcProject = forecast.projects.find((p: FcProject) => p.projectId === businessProject.id);
        if (project && project.plannedProjectDays) {
          forecast.businessDays = project.plannedProjectDays;
        }
      }
    }

    // Calculate URVE + ARVE
    if (!forecast.isRelevant) {
      forecast.urve = 0;
      forecast.arve = 0;
    } else {
      forecast.urve = (forecast.billableDays !== 0) ? ((forecast.billableDays) / (forecast.totalDays - forecast.vacationDays)) : 0;
      if (forecast.urve < 0) {
        forecast.urve = 0;
      }

      forecast.arve = (forecast.billableDays !== 0 || forecast.nonbillableProjectDays !== 0) ? ((forecast.billableDays + forecast.nonbillableProjectDays) / (forecast.totalDays - forecast.vacationDays)) : 0;
      if (forecast.arve < 0) {
        forecast.arve = 0;
      }
    }

    return forecast;
  }

  /**
   * Deletes all forecasts from application
   */
  reset(): void {
    this.forecasts = [];
    this.forecasts$.next(this.forecasts);
  }

  hasLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pdl);
  }

  /**
   * Validates projects before saving forecast
   * @param forecast
   */
  validateProjects(forecast: FcEntry): FcEntry {
    forecast.projects.forEach((p: FcProject) => {
      p.errors = [];

      if (typeof p.projectId === 'undefined') {
        p.errors.push('No project found.');
      }



      // if (typeof p.cor === 'undefined') {
      //   if (this.authService.getRoleId() === env.roles.css) {
      //     p.cor = 0;
      //   } else {
      //     p.errors.push('No COR value defined.');
      //   }
      // } else if (typeof p.cor !== 'number') {
      //   p.errors.push('COR value has to be a number.');
      // } else if (p.cor < 0) {
      //   p.errors.push('COR value has to be a positive number.');
      // }

      if (typeof p.plannedProjectDays === 'undefined') {
        p.errors.push('Number of project days not specified.');
      } else if (typeof p.plannedProjectDays !== 'number') {
        p.errors.push('Project days value has to be a number.');
      } else if (p.plannedProjectDays < 0) {
        p.errors.push('Project days value has to be a positive number.');
      }

      if (!p.probabilityId) {
        p.errors.push('No probability defined.');
      }
      if(p.cor < 1 && p.billable && this.hasLeadRole()) {
        p.errors.push("COR value cannot be 0 or empty.");
      }
    });

    return forecast;
  }

  getForecastLockLevel(monthId: number, userId: number): number | boolean {
    let forecast: FcEntry = this.forecasts.find((fc: FcEntry) => fc.monthId === monthId && fc.userId === userId);
    if (!forecast) {
      return false;
    }

    return forecast.locked;
  }

  /**
   * checks state of forecast: currently "locked" and "edited" possible
   * @param type
   * @param monthId
   * @param userId
   */
  checkForecastState(type: string, monthId: number, userId: number): boolean {
    let forecast: FcEntry = this.forecasts.find((fc: FcEntry) => fc.monthId === monthId && fc.userId === userId);
    if (!forecast) {
      return false;
    }

    if (type === 'locked' && forecast.locked >= this.authService.getRoleId()) {
      return true;
    } else if (type === 'locked-sub' && forecast.locked >= 0 && forecast.locked < this.authService.getRoleId()) {
      return true;
    } else if (type === 'edited' && forecast.updated) {
      return true;
    } else if (type === 'saved' && forecast.locked < 0) {
      var members = this.teamService.getTeamChilds(1, this.authService.getUserId()).concat(this.teamService.getTeamChilds(2, this.authService.getUserId()));
      for(var i = 0; i < members.length; i++) {
        var user = this.userService.getUser(members[i]);
        if(user.email == forecast.changedBy) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * returns promise of all forecasts for one month
   * Returns data instantly if they already exist, otherwise: loads them from the server first
   * @param monthId
   */
  getMonthlyForecasts(monthId: number): Promise<FcEntry[]> {
    let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
      let fcEntries: FcEntry[] = this.forecasts$.getValue().filter((fc: FcEntry) => fc.monthId === monthId);
      if (fcEntries.length > 0) {
        resolve(fcEntries);
      } else {
        this.http.get<FcEntry[]>(this.BO.teamForecast(this.authService.getUserId(), monthId)).subscribe((fc: FcEntry[]) => {
          resolve(fc);
        });
      }
    });

    return promise;
  }

  /**
  * returns forcasts for staffing component
  */
  initStaffingForecasts(monthId: number): void {
    this.pageState.showSpinner();

    this.http
    .get(this.BO.staffingForecasts(monthId))
    .subscribe((forecasts: FcEntry[]) => {
      this.addForecasts(forecasts);
      this.pageState.hideSpinner();
    });
  }
}
