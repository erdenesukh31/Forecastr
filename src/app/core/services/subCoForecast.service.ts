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

  /**
   * observable which returns all available forecasts which have already been loaded from the server
   */
  subcoDetails$: BehaviorSubject<SubCoDetails[]>;

  /**
   * contains all available forecasts which have already been loaded from the server
   */
  subcoDetails: SubCoDetails[];

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
    this.subcoDetails = [];
    this.subcoDetails$ = new BehaviorSubject([]);

    this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;
        this.subcoDetails$.next(this.subcoDetails);
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
  initSubCoDetailsByMonthAndEm(monthId: number, emId: number): Promise<FcEntry[]> {
    let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
      let fcEntries: SubCoDetails[] = this.subcoDetails$.getValue().filter((fc: SubCoDetails) => fc.monthId === monthId && fc.engagementManagerId === emId);
      if (fcEntries.length > 0) {
        resolve(fcEntries);
      } else {
        this.http.get<SubCoDetails[]>(this.BO.getSubCoDetails(monthId, emId)).subscribe((details: SubCoDetails[]) => {
          this.subcoDetails$.next(details);
          this.subcoDetails = details;
          resolve(details);
        });
      }
    });

    return promise;
  }

  
  /**
   * returns promise of all forecasts for one month
   * Returns data instantly if they already exist, otherwise: loads them from the server first
   * @param monthId
   */
   initSubCoDetailsByMonth(monthId: number): Promise<FcEntry[]> {
    let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
      let fcEntries: SubCoDetails[] = this.subcoDetails$.getValue().filter((fc: SubCoDetails) => fc.monthId >= monthId);
      if (fcEntries.length > 0) {
        resolve(fcEntries);
      } else {
        this.http.get<SubCoDetails[]>(this.BO.getSubCoDetailsMonth(monthId)).subscribe((details: SubCoDetails[]) => {
          this.subcoDetails$.next(details);
          this.subcoDetails = details;
          resolve(details);
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
        if (!subCoDetails.subcontractorId || !subCoDetails.monthId || !subCoDetails.projectId) {
          return;
        }    
        if (this.subcoDetails.find((sd: SubCoDetails) => sd.subcontractorId === subCoDetails.subcontractorId && sd.monthId === subCoDetails.monthId)) {
          this.subcoDetails
            .filter((sd: SubCoDetails) => sd.subcontractorId === subCoDetails.subcontractorId && sd.monthId === subCoDetails.monthId)
            .forEach((sd: SubCoDetails) => {
              sd.forecastId = subCoDetails.forecastId;
              //TODO: Add Locked
              // if (typeof forecast.locked !== 'number') {
              //   sd.locked = forecast.locked === true ? this.authService.getRoleId() : -1;
              // } else {
              //   sd.locked = forecast.locked;
              // }  
              sd.lockState = subCoDetails.lockState;
              sd.manDay = subCoDetails.manDay;
              sd.cor = subCoDetails.cor;
              sd.costRate = subCoDetails.costRate;
              sd.revenue = subCoDetails.cor * subCoDetails.manDay;
              sd.cost = subCoDetails.costRate * subCoDetails.manDay;
              sd.contribution = sd.revenue - sd.cost;
              sd.cp = sd.contribution / sd.revenue;
              sd.projectId = subCoDetails.projectId;
            });
        } else {
          //TODO: AddLocked
          // if (typeof subCoDetails.locked !== 'number') {
          //   subCoDetails.locked = subCoDetails.locked === true ? this.authService.getRoleId() : -1;
          // }
          // let u: SubCoDetails = this.subCoService.getSubcoDetail(subCoDetails.subcontractorId);    
          this.subcoDetails.push(subCoDetails);
        }    
        this.subcoDetails$.next(this.subcoDetails);
      }

      getForecastPromise(monthId: number) : Promise<SubCoDetails[]> {
        return this.http.get<SubCoDetails[]>(this.BO.getSubCoDetails(monthId, this.authService.getUserId())).toPromise();
      }

      unlockForecast(forecastId: number) {
        this.http.put(this.BO.setSubcoForecastUnlocked(forecastId),null)
        .subscribe(r =>{
          let subcoDetails : SubCoDetails= this.subcoDetails.find(sd => sd.forecastId === forecastId);
          subcoDetails.lockState = 'Unlocked'
          this.setForecast(subcoDetails, true, false);
        });
    
      }
      saveForecast(monthId: number, subcoId: number, submit: boolean) {
        let subcoDetails: SubCoDetails = cloneDeep(this.subcoDetails.find((fc: SubCoDetails) => fc.subcontractorId === subcoId && fc.monthId === monthId));
        if (!subcoDetails) {
          return;
        }
    
        subcoDetails = this.validateProjects(subcoDetails); //TODO: validate not needed?
        if (subcoDetails.errors.length > 0) {
          subcoDetails.instantValidation = true;
          this.setForecast(subcoDetails, false, true);
    
          this.snackBar.open('Forecast cannot be saved due to one or more invalid data fields.', 'OK', { duration: 5000, });
          return;
        }
    
        if (submit) {
          subcoDetails.lockState = 'LockedState1';
        } else {
          subcoDetails.lockState = 'Unlocked';
        }
    
        //TODO: Add History
        // forecast.history = undefined;
    
        this.pageState.showSpinner();
    
        if(subcoDetails.forecastId && subcoDetails.projectId){
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
        }else if(subcoDetails.projectId){
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
        }else{
          if(!submit) {
            this.snackBar.open('Your forecast could not be saved. Please try again later.', 'OK', { duration: 10000, });
          }
          else if(submit){
            this.snackBar.open('Your forecast could not be submitted. Please try again later.', 'OK', { duration: 10000, });
          }
          this.pageState.hideSpinner();
        }
        
      }

      validateProjects(subcoForecats: SubCoDetails): SubCoDetails {
        
        subcoForecats.errors = [];
    
          if (typeof subcoForecats.projectId === 'undefined') {
            subcoForecats.errors.push('No project found.');
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
    
          if (typeof subcoForecats.manDay === 'undefined') {
            subcoForecats.errors.push('Number of project days not specified.');
          } else if (typeof subcoForecats.manDay !== 'number') {
            subcoForecats.errors.push('Project days value has to be a number.');
          } else if (subcoForecats.manDay < 0) {
            subcoForecats.errors.push('Project days value has to be a positive number.');
          }
    
          if (!subcoForecats.probabilityId) {
            subcoForecats.errors.push('No probability defined.');
          }
          if(subcoForecats.cor < 1) {
            subcoForecats.errors.push("COR value cannot be 0 or empty.");
          }
        return subcoForecats;
      }
}


