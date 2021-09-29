import { Component, OnInit, Input, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubCoForecastService } from '../../../core/services/subCoForecast.service';
import { ExecutiveForecastsService } from '../../../core/services/forecasts/executive-forecasts.service';
import { SubCoDetails as SubCoDetails } from '../../../core/interfaces/subCoDetails';


/**
 * forecast-entry component
 */
@Component({
  selector: 'app-subco-fc-entry',
  templateUrl: './subco-fc-entry.component.html',
  styleUrls: [ './subco-fc-entry.component.scss' ],
})
export class SubcoFcEntryComponent implements OnInit, OnDestroy {
  /**
   * userId (received as input)
   */
  @Input('subcoId') subcoId: number;

  /**
   * selected month (received as input)
   */
  @Input('month') month: Month;

  /**
   * event to subscribe to if there is no forecast for the current user and month
   */
   @Output() foreCastEmptyEvent = new EventEmitter();

  /**
   * Contains the newest version of forecast
   */
  subCoDetails: SubCoDetails;
  project: Project;

  /**
   * string that includes name + date of last edit
   */
  lastEditor: string = '';
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
   * @param subcoForecastService
   */
  constructor(
    private dialog: MatDialog,
    private utilitiesService: UtilitiesService,
    private subcoForecastService: SubCoForecastService,
    private executiveService: ExecutiveForecastsService,
    private userService: UserService,
    private authService: AuthService,
    private dataSharingService: DataSharingService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Initializes forecast entry component.
   */
  ngOnInit(): void {
    this.fcLoaded = true;
    this.loadingActive = true;

    //only subscribe to forecasts if there is none
    //since changing of months in handeled in the ngOnChanges function
    if(!this.subCoDetails)
      this.subscribeForcasts();

    this.project = this.utilitiesService.getProjects().find(p => p.id === this.subCoDetails.projectId);
    // this.project = new Project();

    this.dataSharingService.hasProjectInputFocus().subscribe(hasFocus => this.hasProjectInputFocus = hasFocus);
    this.dataSharingService.isProjectInputValid().subscribe(isValid => this.isProjectInputValid = isValid);
    this.dataSharingService.isCorValueBiggerThanZero().subscribe(isBigger => this.isCorValueBiggerThanZero = isBigger);
  }

  subscribeForcasts():void {
    this.fcSubscription = this.subcoForecastService.subcoDetails$
    .subscribe((forecasts: SubCoDetails[]) => {
      this.subCoDetails = forecasts.find((fc: SubCoDetails) => fc.monthId === this.month.id && fc.subcontractorId === this.subcoId);
      if (!this.subCoDetails) {
        //Add Empty Forecast
        this.subCoDetails = new SubCoDetails();
        this.subCoDetails.subcontractorId = this.subcoId;
        this.subCoDetails.monthId = this.month.id;
        this.subcoForecastService.forecasts.push(this.subCoDetails);
        this.fcLoaded = true;
        this.loadingActive = false;
        // this.subcoForecastService.loadForecast(this.subcoId, this.month.id).then((res: any) => {
        //   if (!res.showDialog || !res.suggestedData) {
        //     return;
        //   }
        //   /**
        //    * For the next release in the future, the copy data functionality will be added
        //    */

        //   if (res.suggestedData.projects.length > 0 || res.suggestedData.fte !== this.forecast.fte || res.suggestedData.gradeId !== this.forecast.gradeId) {
        //     let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
        //       data: {
        //         message: 'Copy data from last month submitted?',
        //         button: { cancel: 'No', submit: 'Yes' },
        //       },
        //     });

        //     dialogRef.afterClosed().subscribe((add: boolean) => {
        //       if (add === true) {
        //         this.subcoForecastService.addProjectsToForecast(this.subcoId, this.month.id, res.suggestedData);
        //       }
        //     });
        //   }
        // });

      } else {
        this.fcLoaded = true;
        this.loadingActive = false;

        // if (typeof this.forecast.fte !== 'undefined') { // switched because forecast fte should be taken primary from saved/submitted forcast
        //   this.fteSliderValue = this.forecast.fte * 100;
        // }
        // else if(typeof this.userService.getUser(this.subcoId).fte !== 'undefined') {
        //   this.fteSliderValue = this.userService.getUser(this.subcoId).fte * 100;
        //   this.forecast.fte = this.userService.getUser(this.subcoId).fte;
        // }      
        // else {
        //   this.fteSliderValue = 100;
        // }
        // if (this.forecast.history && this.forecast.history.length > 0 && this.forecast.history[0].createdAt) {
        //   let date: string = formatDate(this.forecast.history[0].createdAt, 'dd.MM.yyyy', 'en');
        //   this.lastEditor = 'Last updated from ' + this.forecast.history[0].changedBy + ', ' + date;
        // } else {
        //   let date: string = formatDate(this.forecast.createdAt, 'dd.MM.yyyy', 'en');
        //   this.lastEditor = 'Last updated from ' + this.forecast.changedBy + ', ' + date;
        // }

        // if(typeof this.forecast.gradeId === 'undefined') {
        //   this.forecast.gradeId = this.userService.getUser(this.subcoId).gradeId; 
        // }
        
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
    this.subcoForecastService.saveForecast(this.month.id, this.subcoId, false);
  }

  /**
   * Submits forecast (save + "locked: true")
   */
  submitForecast(): void {
    this.subcoForecastService.saveForecast(this.month.id, this.subcoId, true);
  }

  /**
   * Unlock a forecast
   */
  unlockForecast(): void {
    this.subcoForecastService.unlockForecast(this.month.id, this.subcoId);
  }

  /**
   * Adds a new project.
   * Sets the cursor focus at the beginning of the newly added project.
   * @param id
   * @param days
   * @param probabilityId
   */
  addProjectToForecast(): void {
    this.subcoForecastService.addProject(
      this.month.id,
      this.subcoId,
      new FcProject(),
    );

    // Sets the focus to newly added project
    setTimeout(() => {
      const el: any = document.querySelector('#project-' + this.month.id + '-' + (this.subCoDetails.projectName));
      el.querySelector('.mat-input-element').focus();
    }, 100);
  }

  // fteSliderValueUpdate(): void {

  //   this.forecast.fte = parseFloat((this.fteSliderValue / 100).toFixed(3));
  //   this.subcoForecastService.setForecast(this.forecast, false, true);

  // }

  settingsUpdate(): void {
    this.subcoForecastService.setForecast(this.subCoDetails, false, false); //TODO: is sumbitted false?
  }

  // fteValue(): any {
  //   if (typeof this.forecast.fte !== 'undefined') {
  //     return Math.round(this.forecast.fte * 1000) / 10;
  //   }
  //   return 100;
  // }

  /**
   * Calculates the total number of days for projects.
   */
  // totalDays(): number {
  //   return this.forecast.billableDays + this.forecast.nonbillableDays;
  // }

  /**
   * Test if user fulfills certain role criteria
   */
  // hasLeadRole(): boolean {
  //   return this.authService.hasRole(env.roles.pdl);
  // }

  // hasMSLRole(): boolean {
  //   return this.authService.hasRole(env.roles.msl);
  // }

  // hasUnlockPermission(level: number): boolean {
  //   if (this.authService.hasRole(level) || this.forecast.locked < this.authService.getRoleId()) {
  //     return true;
  //   }
  //   return false;
  // }

  /**
   * Test is forecast is locked for logged-in user
   */
  fcIsLocked(): boolean {
    return false;
    //TODO: Add Locked
    // if (this.forecast && this.forecast.locked >= this.authService.getRoleId()) {
    //   return true;
    // }
    // return false;
  }

  fcLockedBySub(): boolean {
    return false;
    //TODO: Add Locked
    // if (this.forecast && this.forecast.locked >= 0 && this.forecast.locked < this.authService.getRoleId()) {
    //   return true;
    // }
    // return false;
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
    this.subcoForecastService.loadForecast(this.subcoId, this.month.id).then((res: any) => {
    });
  }

  /**
   * Called if there are changes to input fields
   * @param changes an dict of changes. Value at Key is undefined if there are no chagnes.
   */
  
  ngOnChanges(changes: SimpleChanges){
    //If there are changes to the current month BUT its not the first time this chagnes happen
    if(changes['month'] && !changes['month'].isFirstChange()){
      this.loadingActive = true;
      this.fcLoaded = false;
      this.fcSubscription.unsubscribe();
      this.fcSubscription = this.subcoForecastService.subcoDetails$.subscribe((subCoDetails: SubCoDetails[]) => {
        this.subCoDetails = subCoDetails.find((fc: SubCoDetails) => fc.monthId === this.month.id && fc.subcontractorId === this.subcoId);
      });
      //init the new month to be retrivable by the forecast service subscription
      this.executiveService.initializeDetailValues(this.month.id).then(()=>{
        //when the data is initialized
        //this should be nearly the same time the subscription received it's value
        this.loadingActive = false;
        this.fcLoaded = true;
        //Since the subscription should already have fired this forecast should only be undefined if there is no forecast
        if(!this.subCoDetails){
          this.subCoDetails = undefined;
          this.foreCastEmptyEvent.emit();
          this.snackBar.open('There is no forceast for this user and ' + this.month.name, 'Ok', { duration: 10000, });
        }
      });
    }
  }
}
