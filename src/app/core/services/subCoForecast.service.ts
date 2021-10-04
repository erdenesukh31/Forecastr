import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FcProject } from '../interfaces/fcProject';
import { Project } from '../interfaces/project';
import { FcEntry } from '../interfaces/fcEntry';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { Month } from '../interfaces/month';
import { UtilitiesService } from './utilities.service';
import { AuthService } from '../security/auth.service';
import { PageStateService } from '../shared/page-state.service';
import { SubCoService } from './subCo.service';
import { SubCoDetails } from '../interfaces/subCoDetails';
import { environment as env } from '../../../environments/environment.prod';
import { cloneDeep } from 'lodash';
import { DataSharingService } from '../shared/data-sharing.service';
import { Router } from '@angular/router';
import { Suggestion } from '../interfaces/suggestion';
import { resolve } from 'url';
import { SubcosComponent } from '../../forecast/pages/subcos/subcos.component';
import { User } from '../interfaces/user';

/**
 * forecast service
 */
@Injectable({
  providedIn: 'root',
})
export class SubCoForecastService {
  validateProjects(subcoDetails: SubCoDetails) {
    throw new Error("Method not implemented.");
  }
  loadForecast(subcoId: number, id: number) :Promise<FcEntry[]> {
    throw new Error('Method not implemented.');
  }
  addProject(id: number, subcoId: number, arg2: FcProject) {
    throw new Error('Method not implemented.');
  }
  unlockForecast(id: number, subcoId: number) {
    throw new Error('Method not implemented.');
  }
  saveForecast(monthId: number, subcoId: number, submit: boolean) {
    let subcoDetails: SubCoDetails = cloneDeep(this.forecasts.find((fc: SubCoDetails) => fc.subcontractorId === subcoId && fc.monthId === monthId));
    if (!subcoDetails) {
      return;
    }

    // forecast = this.validateProjects(forecast); //TODO: validate not needed?
    // if (([].concat.apply([], forecast.projects.map((p: FcProject) => p.errors))).length > 0) {
    //   forecast.instantValidation = true;
    //   this.setForecast(forecast, false, true);

    //   this.snackBar.open('Forecast cannot be saved due to one or more invalid data fields.', 'OK', { duration: 5000, });
    //   return;
    // }

    //TODO: Add Locked
    // if (submit) {
    //   forecast.locked = true;
    // } else {
    //   forecast.locked = false;
    // }

    //TODO: Add History
    // forecast.history = undefined;

    this.pageState.showSpinner();

    if(subcoDetails.forecastId && subcoDetails.forecastId){
      this.http.put(this.BO.subcoForecast(subcoDetails.forecastId), subcoDetails)
      .subscribe((subcoDetails: SubCoDetails) => {
        this.setForecast(subcoDetails, true, false);
        if(!submit) {
          this.snackBar.open('Your forecast has been successfully saved.', 'OK', { duration: 5000, });
        }
        else {
          this.snackBar.open('Your forecast has been successfully submitted.', 'OK', { duration: 5000, });
        }
        
        this.pageState.hideSpinner();

      }, (e: any) => {
        if(e.status === 409) {
          // if(!this.hasLeadRole()) {
          //   this.snackBar.open('Your forecast has already been submitted by your team lead. Please contact your supervisor. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          // }
          // else {
          //   this.snackBar.open('The forecast has already been submitted by your colleague. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          // }

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
    }else{
      this.http.post(this.BO.createSubcoForecast(), subcoDetails)
      .subscribe((sd: SubCoDetails) => {
        this.setForecast(sd, true, false);
        if(!submit) {
          this.snackBar.open('Your forecast has been successfully saved.', 'OK', { duration: 5000, });
        }
        else {
          this.snackBar.open('Your forecast has been successfully submitted.', 'OK', { duration: 5000, });
        }
        
        this.pageState.hideSpinner();

      }, (e: any) => {
        if(e.status === 409) {
          // if(!this.hasLeadRole()) {
          //   this.snackBar.open('Your forecast has already been submitted by your team lead. Please contact your supervisor. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          // }
          // else {
          //   this.snackBar.open('The forecast has already been submitted by your colleague. The page will be refreshed automatically.', 'OK', { duration: 10000, });
          // }

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
  }
  /**
   * observable which returns all available forecasts which have already been loaded from the server
   */
  subcoDetails$: BehaviorSubject<SubCoDetails[]>;

  /**
   * contains all available forecasts which have already been loaded from the server
   */
  forecasts: SubCoDetails[];

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
    private subCoService: SubCoService,
    private dataSharingService: DataSharingService,
    private router: Router,
  ) {
    this.forecasts = [];
    this.subcoDetails$ = new BehaviorSubject([]);

    this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;
        this.subcoDetails$.next(this.forecasts);
      });

    this.utilitiesService.months$
      .subscribe((months: Month[]) => {
        this.months = months;
      });
    
  }

  /**
   * returns promise of all forecasts for one month
   * Returns data instantly if they already exist, otherwise: loads them from the server first
   * @param monthId
   */
  initSubCoForecastByMonth(monthId: number,emId: number): Promise<FcEntry[]> {
    let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
      let fcEntries: SubCoDetails[] = this.subcoDetails$.getValue().filter((fc: SubCoDetails) => fc.monthId === monthId && fc.engagementManagerId === emId);
      if (fcEntries.length > 0) {
        resolve(fcEntries);
      } else {
        this.http.get<SubCoDetails[]>(this.BO.getSubCoForecasts(monthId, this.authService.getUserId())).subscribe((fc: SubCoDetails[]) => {
          this.subcoDetails$.next(fc);
          resolve(fc);
        });
      }
    });

    return promise;
  }

   /**
   * returns promise of all forecasts a month range
   * Returns data instantly if they already exist, otherwise: loads them from the server first
   * @param monthId
   */
    initSubCoForecastMonthRange(startMonthId: number,endMonthId:number,emId: number): Promise<FcEntry[]> {
        let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
          let fcEntries: SubCoDetails[] = this.subcoDetails$.getValue().filter((fc: SubCoDetails) => fc.monthId >= startMonthId && fc.monthId <= endMonthId && fc.engagementManagerId === emId);
          if (fcEntries.length > 0) {
            resolve(fcEntries);
          } else {
            this.http.get<FcEntry[]>(this.BO.getSubCoForecastsMonthRange(startMonthId, endMonthId,this.authService.getUserId()))
            .subscribe((fc: FcEntry[]) => {
              resolve(fc);
            });
          }
        });
    
        return promise;
      }

     /**
   * changes promise of all forecasts for one month
   * @param monthId
   */
  
    putSubCoForecastByMonth(subCoForecastId:number): Promise<SubCoDetails[]> {
        let promise: Promise<SubCoDetails[]> = new Promise((resolve: any, reject: any) => {
          let fcEntries: SubCoDetails[] = this.subcoDetails$.getValue().filter((fc: SubCoDetails) => fc.forecastId === subCoForecastId);
          if (fcEntries.length > 0) {
            resolve(fcEntries);
          } else {
            
            this.http.get<SubCoDetails[]>(this.BO.updateSubCoForecasts(subCoForecastId)).subscribe((fc: SubCoDetails[]) => {
              resolve(fc);
            });
          }
        });
    
        return promise;
      }
      
      setForecast(subCoDetails: SubCoDetails, loadHistory: boolean, updated: boolean = false): void { //TODO: add LoadHistory
        if (!subCoDetails.subcontractorId || !subCoDetails.monthId) {
          return;
        }    
        if (this.forecasts.find((sd: SubCoDetails) => sd.subcontractorId === subCoDetails.subcontractorId && sd.monthId === subCoDetails.monthId)) {
          this.forecasts
            .filter((sd: SubCoDetails) => sd.subcontractorId === subCoDetails.subcontractorId && sd.monthId === subCoDetails.monthId)
            .forEach((sd: SubCoDetails) => {
              sd.forecastId = subCoDetails.forecastId;
              //TODO: Add Locked
              // if (typeof forecast.locked !== 'number') {
              //   sd.locked = forecast.locked === true ? this.authService.getRoleId() : -1;
              // } else {
              //   sd.locked = forecast.locked;
              // }  
              sd.manDay = subCoDetails.manDay;
              sd.cor = subCoDetails.cor;
              sd.costRate = subCoDetails.costRate;
              sd.projectId = subCoDetails.projectId;
            });
        } else {
          //TODO: AddLocked
          // if (typeof subCoDetails.locked !== 'number') {
          //   subCoDetails.locked = subCoDetails.locked === true ? this.authService.getRoleId() : -1;
          // }
          let u: SubCoDetails = this.subCoService.getSubcoDetail(subCoDetails.subcontractorId);    
          this.forecasts.push(subCoDetails);
        }    
        this.subcoDetails$.next(this.forecasts);
      }
}


