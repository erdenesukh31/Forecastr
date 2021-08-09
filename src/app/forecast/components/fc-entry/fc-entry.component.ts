import { Component, OnInit, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ForecastService } from '../../../core/services/forecasts/forecast.service';
import { UtilitiesService } from '../../../core/services/utilities.service';

import { FcEntry } from '../../../core/interfaces/fcEntry';
import { Month } from '../../../core/interfaces/month';
import { Project } from '../../../core/interfaces/project';
import { Subscription } from 'rxjs';
import { FcProject } from '../../../core/interfaces/fcProject';
import { UserService } from '../../../core/services/user.service';
import { Grade } from '../../../core/interfaces/grade';
import { AuthService } from '../../../core/security/auth.service';
import { environment as env } from '../../../../environments/environment';
import { ConfirmMessageDialog } from '../../dialogs/confirm-message/confirm-message.dialog';
import { DataSharingService } from '../../../core/shared/data-sharing.service';
import { ExecutiveForecastsService } from '../../../core/services/forecasts/executive-forecasts.service';


/**
 * forecast-entry component
 */
@Component({
  selector: 'app-fc-entry',
  templateUrl: './fc-entry.component.html',
  styleUrls: [ './fc-entry.component.scss' ],
})
export class FcEntryComponent implements OnInit, OnDestroy {
  /**
   * userId (received as input)
   */
  @Input('userId') userId: number;

  /**
   * selected month (received as input)
   */
  @Input('month') month: Month;

  /**
   * singleView: true in 'individual'-view, false in 'teamlead'-view
   */
  @Input('singleView') singleView: boolean;

  /**
   * Contains the newest version of forecast
   */
  forecast: FcEntry;
  availableProjects: Project[] = [];

  /**
   * string that includes name + date of last edit
   */
  lastEditor: string = '';
  grades: Grade[] = [];
  fteSliderValue: number;
  fcLoaded: boolean = false;
  fcSubscription: Subscription;
  loadingActive: boolean = false;

  hasProjectInputFocus: boolean;
  isProjectInputValid: boolean;
  isCorValueBiggerThanZero: boolean;

  /**
   * forecast-entry component constructor
   * @param utilitiesService
   * @param forecastService
   */
  constructor(
    private dialog: MatDialog,
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private executiveService: ExecutiveForecastsService,
    private userService: UserService,
    private authService: AuthService,
    private dataSharingService: DataSharingService
  ) {}

  /**
   * Initializes forecast entry component.
   */
  ngOnInit(): void {
    if(!this.singleView) {
      this.fcLoaded = true;
      this.loadingActive = true;
    }

    if(!this.forecast)
      this.subscribeForcasts();

    this.grades = this.userService.getGrades();
    this.availableProjects = this.utilitiesService.getProjects();

    this.dataSharingService.hasProjectInputFocus().subscribe(hasFocus => this.hasProjectInputFocus = hasFocus);
    this.dataSharingService.isProjectInputValid().subscribe(isValid => this.isProjectInputValid = isValid);
    this.dataSharingService.isCorValueBiggerThanZero().subscribe(isBigger => this.isCorValueBiggerThanZero = isBigger);
  }

  subscribeForcasts():void {
    this.fcSubscription = this.forecastService.forecasts$
    .subscribe((forecasts: FcEntry[]) => {
      this.forecast = forecasts.find((fc: FcEntry) => fc.monthId === this.month.id && fc.userId === this.userId);
      if (!this.forecast) {
        this.forecastService.loadForecast(this.userId, this.month.id).then((res: any) => {
          if (!res.showDialog || !res.suggestedData || !this.singleView) {
            return;
          }
          /**
           * For the next release in the future, the copy data functionality will be added
           */

          if (res.suggestedData.projects.length > 0 || res.suggestedData.fte !== this.forecast.fte || res.suggestedData.gradeId !== this.forecast.gradeId) {
            let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
              data: {
                message: 'Copy data from last month submitted?',
                button: { cancel: 'No', submit: 'Yes' },
              },
            });

            dialogRef.afterClosed().subscribe((add: boolean) => {
              if (add === true) {
                this.forecastService.addProjectsToForecast(this.userId, this.month.id, res.suggestedData);
              }
            });
          }
        });

      } else {
        this.fcLoaded = true;
        this.loadingActive = false;

        if (typeof this.forecast.fte !== 'undefined') { // switched because forecast fte should be taken primary from saved/submitted forcast
          this.fteSliderValue = this.forecast.fte * 100;
        }
        else if(typeof this.userService.getUser(this.userId).fte !== 'undefined') {
          this.fteSliderValue = this.userService.getUser(this.userId).fte * 100;
          this.forecast.fte = this.userService.getUser(this.userId).fte;
        }      
        else {
          this.fteSliderValue = 100;
        }
        if (this.forecast.history && this.forecast.history.length > 0 && this.forecast.history[0].createdAt) {
          let date: string = formatDate(this.forecast.history[0].createdAt, 'dd.MM.yyyy', 'en');
          this.lastEditor = 'Last updated from ' + this.forecast.history[0].changedBy + ', ' + date;
        } else {
          let date: string = formatDate(this.forecast.createdAt, 'dd.MM.yyyy', 'en');
          this.lastEditor = 'Last updated from ' + this.forecast.changedBy + ', ' + date;
        }

        if(typeof this.forecast.gradeId === 'undefined') {
          this.forecast.gradeId = this.userService.getUser(this.userId).gradeId; 
        }
        
      }
    });
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.fcSubscription.unsubscribe();
  }

  /**
   * Saves forecast
   */
  saveForecast(): void {
    this.forecastService.saveForecast(this.month.id, this.userId, false);
  }

  /**
   * Submits forecast (save + "locked: true")
   */
  submitForecast(): void {
    this.forecastService.saveForecast(this.month.id, this.userId, true);
  }

  /**
   * Unlock a forecast
   */
  unlockForecast(): void {
    this.forecastService.unlockForecast(this.month.id, this.userId);
  }

  /**
   * Adds a new project.
   * Sets the cursor focus at the beginning of the newly added project.
   * @param id
   * @param days
   * @param probabilityId
   */
  addProjectToForecast(): void {
    this.forecastService.addProject(
      this.month.id,
      this.userId,
      new FcProject(),
    );

    // Sets the focus to newly added project
    setTimeout(() => {
      const el: any = document.querySelector('#project-' + this.month.id + '-' + (this.forecast.projects.length - 1));
      el.querySelector('.mat-input-element').focus();
    }, 100);
  }

  fteSliderValueUpdate(): void {

    this.forecast.fte = parseFloat((this.fteSliderValue / 100).toFixed(3));
    this.forecastService.setForecast(this.forecast, false, true);

  }

  settingsUpdate(): void {
    this.forecastService.setForecast(this.forecast, false, true);
  }

  fteValue(): any {
    if (typeof this.forecast.fte !== 'undefined') {
      return Math.round(this.forecast.fte * 1000) / 10;
    }
    return 100;
  }

  /**
   * Calculates the total number of days for projects.
   */
  totalDays(): number {
    return this.forecast.billableDays + this.forecast.nonbillableDays;
  }

  /**
   * Test if user fulfills certain role criteria
   */
  hasLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pdl);
  }

  hasMSLRole(): boolean {
    return this.authService.hasRole(env.roles.msl);
  }

  hasUnlockPermission(level: number): boolean {
    if (this.authService.hasRole(level) || this.forecast.locked < this.authService.getRoleId()) {
      return true;
    }
    return false;
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

  fcLockedBySub(): boolean {
    if (this.forecast && this.forecast.locked >= 0 && this.forecast.locked < this.authService.getRoleId()) {
      return true;
    }
    return false;
  }
  openDialog(): void {
    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
      width: '250px',
      data: {
             message: 'Copy data from last submitted month?',
             button: { cancel: 'No', submit: 'Yes' },
             },
    });
  }
  copyData():void {
    this.forecastService.loadForecast(this.userId, this.month.id).then((res: any) => {
    this.forecastService.addProjectsToForecast(this.userId, this.month.id, res.suggestedData);
    });
  }

  
  ngOnChanges(changes: SimpleChanges){
    if(changes['month'] && !changes['month'].isFirstChange()){
      this.loadingActive = true;
      this.fcLoaded = false;
      this.executiveService.initializeDetailValues(this.month.id);
      this.fcSubscription.unsubscribe();
      this.fcSubscription = this.forecastService.forecasts$.subscribe((forecasts: FcEntry[]) => {
        this.forecast = forecasts.find((fc: FcEntry) => fc.monthId === this.month.id && fc.userId === this.userId);
        if(this.forecast)
        {
          this.loadingActive = false;
          this.fcLoaded = true;
          this.fcSubscription.unsubscribe();
        }
      });
    }
  }
}