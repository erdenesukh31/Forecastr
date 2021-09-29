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
import { subCoDetails } from '../interfaces/subCoDetails';
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
  loadForecast(subcoId: number, id: number) :Promise<FcEntry[]> {
    throw new Error('Method not implemented.');
  }
  setForecast(forecast: FcEntry, arg1: boolean, arg2: boolean) {
    throw new Error('Method not implemented.');
  }
  addProject(id: number, subcoId: number, arg2: FcProject) {
    throw new Error('Method not implemented.');
  }
  unlockForecast(id: number, subcoId: number) {
    throw new Error('Method not implemented.');
  }
  saveForecast(id: number, subcoId: number, arg2: boolean) {
    throw new Error('Method not implemented.');
  }
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
    private subCoService: SubCoService,
    private dataSharingService: DataSharingService,
    private router: Router,
  ) {
    this.forecasts = [];
    this.forecasts$ = new BehaviorSubject([]);

    this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;
        this.forecasts$.next(this.forecasts);
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
      let fcEntries: FcEntry[] = this.forecasts$.getValue().filter((fc: FcEntry) => fc.monthId === monthId && fc.userId === emId);
      if (fcEntries.length > 0) {
        resolve(fcEntries);
      } else {
        this.http.get<FcEntry[]>(this.BO.getSubCoForecasts(monthId, this.authService.getUserId())).subscribe((fc: FcEntry[]) => {
          this.forecasts$.next(fc);
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
          let fcEntries: FcEntry[] = this.forecasts$.getValue().filter((fc: FcEntry) => fc.monthId >= startMonthId && fc.monthId <= endMonthId && fc.userId === emId);
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
  
    putSubCoForecastByMonth(subCoForecastId:number): Promise<FcEntry[]> {
        let promise: Promise<FcEntry[]> = new Promise((resolve: any, reject: any) => {
          let fcEntries: FcEntry[] = this.forecasts$.getValue().filter((fc: FcEntry) => fc.forecastId === subCoForecastId);
          if (fcEntries.length > 0) {
            resolve(fcEntries);
          } else {
            
            this.http.get<FcEntry[]>(this.BO.updateSubCoForecasts(subCoForecastId)).subscribe((fc: FcEntry[]) => {
              resolve(fc);
            });
          }
        });
    
        return promise;
      }
      
      setForecast(forecast: FcEntry, updated: boolean = false): void {
        if (!forecast.userId || !forecast.monthId) {
          return;
        }    
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
              fc.gradeId = forecast.gradeId;
              fc.isRelevant = forecast.isRelevant;
              // fc.projects = mandatoryProjects;
              fc.updated = updated;      
            });
        } else {
          if (typeof forecast.locked !== 'number') {
            forecast.locked = forecast.locked === true ? this.authService.getRoleId() : -1;
          }
          let u: subCoDetails = this.subCoService.getSubcoDetail(forecast.userId);    
          this.forecasts.push(forecast);
        }    
        this.forecasts$.next(this.forecasts);
      }
      

  
}
