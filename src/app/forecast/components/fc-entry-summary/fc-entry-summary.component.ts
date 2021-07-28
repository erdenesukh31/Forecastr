import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

import { FcProject } from '../../../core/interfaces/fcProject';
import { Month } from '../../../core/interfaces/month';

import { ForecastService } from '../../../core/services/forecasts/forecast.service';
import { UtilitiesService } from '../../../core/services/utilities.service';
import { Project } from '../../../core/interfaces/project';
import { FcEntry } from '../../../core/interfaces/fcEntry';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/security/auth.service';
import { environment as env } from '../../../../environments/environment';
import { DataSharingService } from '../../../core/shared/data-sharing.service';
import { SummaryDataProject, SummaryData } from '../../../core/interfaces/summaryData';
import { User } from '../../../core/interfaces/user';

/**
 * forecast-entry individual summary component
 */
@Component({
  selector: 'app-fc-entry-summary',
  templateUrl: './fc-entry-summary.component.html',
  styleUrls: ['./fc-entry-summary.component.scss'],
})
export class FcEntrySummaryComponent implements OnInit, OnDestroy {
  /**
   * userId (received as input)
   */
  @Input('userId') userId: number;

  /**
   * month (received as input)
   */
  @Input('month') month: Month;

  /**
   * Contains the newest version of forecast
   */
  forecast: FcEntry;

  projects: Project[];

  fcProjectsDS: MatTableDataSource<FcProject>;
  fcSubscription: Subscription;
  projectSubscription: Subscription;

  hasProjectInputFocus: boolean;
  isProjectInputValid: boolean;
  isCorValueBiggerThanZero: boolean;

  remainingDays: number;

  summaryData: MatTableDataSource<any>;

  user: User;

  /**
   * forecast-entry summary constructor
   */
  constructor(
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private authService: AuthService,
    private dataSharingService: DataSharingService,
    private snackBar: MatSnackBar,
  ) { 
    
  }

  /**
   * Initializes the entry-summary component.
   */
  ngOnInit(): void {
    

    this.fcSubscription = this.forecastService.forecasts$
      .subscribe((forecasts: FcEntry[]) => {
        this.forecast = forecasts.find((fc: FcEntry) => fc.monthId === this.month.id && fc.userId === this.userId);
        if (this.forecast) {
          this.fcProjectsDS = new MatTableDataSource(this.forecast.projects.filter((p: FcProject) => typeof p.projectId !== 'undefined'));
          this.summaryData = new MatTableDataSource(
            [
              {title: "Expected working days", days: (this.forecast.totalDays)},
              {title: "Billable days", days: (this.forecast.billableDays)},
              {title: "Non-billable days", days: (this.forecast.nonbillableDays)},
              {title: "Total forecasted days", days: (this.forecast.billableDays + this.forecast.nonbillableDays)},
              {title: "Remaining days to forecast", days: (this.forecast.totalDays - (this.forecast.billableDays + this.forecast.nonbillableDays))},
            ]
          );
        }
      });

    this.projectSubscription = this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;
      });

    this.dataSharingService.hasProjectInputFocus().subscribe(hasFocus => this.hasProjectInputFocus = hasFocus);
    this.dataSharingService.isProjectInputValid().subscribe(isValid => this.isProjectInputValid = isValid);
    this.dataSharingService.isCorValueBiggerThanZero().subscribe(isBigger => this.isCorValueBiggerThanZero = isBigger);
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.fcSubscription.unsubscribe();
    this.projectSubscription.unsubscribe();
  }

  /**
   * Calls comment-update in forecast-service.
   */
  commentUpdate(): void {
    this.forecastService.setForecastComment(this.month.id, this.userId, this.forecast.comment);
  }

  /**
   * Calls save forecast in forecast-service.
   */
  saveForecast(): void {
    for(var i = 0; i < this.forecast.projects.length; i++) {
      if(this.forecast.projects[i].mandatory == "N" && this.forecast.projects[i].plannedProjectDays <= 0) {
        this.snackBar.open("You can't forecast 0 days for non-mandatory projects!", 'OK', { duration: 10000, });
        return;
      }
    }
    
    this.forecastService.saveForecast(this.month.id, this.userId);
    if (!(navigator.userAgent.indexOf("Firefox") > -1)) window.location.reload();
  }

  /**
   * Submits forecast (save + lock)
   */
  submitForecast(remainDays: number): void {
    for(var i = 0; i < this.forecast.projects.length; i++) {
      if(this.forecast.projects[i].mandatory == "N" && this.forecast.projects[i].plannedProjectDays <= 0) {
        this.snackBar.open("You can't forecast 0 days for non-mandatory projects!", 'OK', { duration: 10000, });
        return;
      }
    }

    this.remainingDays = remainDays;
    this.forecastService.saveForecast(this.month.id, this.userId, true);
    if (!(navigator.userAgent.indexOf("Firefox") > -1)) window.location.reload();
  }

  /**
   * Unlock a forecast
   */
  unlockForecast(): void {
    this.forecastService.unlockForecast(this.month.id, this.userId);
  }

  /**
   * Calculates the percentage value
   * @param value
   */
  percentageValue(value: number): number {
    return parseFloat((value * 100).toFixed(0));
  }

  /**
   * Returns the project name to a given id.
   * @param id
   */
  projectName(id: number): string | undefined {
    if (id === 0) {
      return 'Non billable days';
    }
    return this.projects.find((p: Project) => p.id === id) ? this.projects.find((p: Project) => p.id === id).name : undefined;
  }

  /**
   * Returns whether the logged in user has a lead role
   */
  hasLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pdl);
  }

  /**
   * Returns whether the logged in user has a practice lead role
   */
  hasPracticeLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pl);
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
  errorMessage(hasProjectInputFocus: boolean, isProjectInputValid: boolean,isCorValueBiggerThanZero: boolean): string{
    if(hasProjectInputFocus) {
     return "Please choose a project";
   } 
    else if (isProjectInputValid) {
      return "Required fields missing (e.g. days, probability) "
    }
    else {
      return ""
    }
  }
}
