import { Component, OnInit, Input, OnDestroy, SimpleChanges, Output, EventEmitter,OnChanges } from '@angular/core';
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
export class SubcoFcEntryComponent implements OnInit, OnDestroy, OnChanges {
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

    this.subscribeForcasts();

    this.dataSharingService.hasProjectInputFocus().subscribe(hasFocus => this.hasProjectInputFocus = hasFocus);
    this.dataSharingService.isProjectInputValid().subscribe(isValid => this.isProjectInputValid = isValid);
    this.dataSharingService.isCorValueBiggerThanZero().subscribe(isBigger => this.isCorValueBiggerThanZero = isBigger);
  }

  subscribeForcasts():void {
    this.fcSubscription = this.subcoForecastService.subcoDetails$
    .subscribe((forecasts: SubCoDetails[]) => {
      this.subCoDetails = forecasts.find((fc: SubCoDetails) =>  fc.subcontractorId === this.subcoId && fc.monthId == this.month.id);
      if(this.subCoDetails && this.subCoDetails.projectId && !this.project)
        this.project = this.utilitiesService.getProjects().find(p => p.id === this.subCoDetails.projectId);
      else
        this.project = new Project();

      if (!this.subCoDetails) {
        //Add Empty Forecast
        this.subCoDetails = new SubCoDetails();
        this.subCoDetails.engagementManagerId = this.authService.getUserId();
        this.subCoDetails.costRate = 0;
        this.subCoDetails.cor = 0;
        this.subCoDetails.manDay = 0;
        this.subCoDetails.contribution = 0;
        this.subCoDetails.revenue = 0;
        this.subCoDetails.cp = 0;
        this.subCoDetails.lockState = 'Unlocked';
        this.subCoDetails.subcontractorId = this.subcoId;
        this.subCoDetails.monthId = this.month.id;
        this.subCoDetails.probabilityId = 2;
        this.project = new Project();
        // this.subcoForecastService.subcoDetails.push(this.subCoDetails);
      }
      this.fcLoaded = true;
      this.loadingActive = false;
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
    this.subcoForecastService.unlockForecast(this.subCoDetails.forecastId);
  }


  settingsUpdate(): void {
    this.subcoForecastService.setForecast(this.subCoDetails, false, false); //TODO: is sumbitted false?
  }

  /**
   * Test is forecast is locked for logged-in user
   */
  fcIsLocked(): boolean {
    if (this.subCoDetails && this.subCoDetails.lockState !== 'Unlocked') {
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
