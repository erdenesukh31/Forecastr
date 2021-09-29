import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { subCoDetails } from '../interfaces/subCoDetails';
import { subCoPreview } from '../interfaces/subCoPreview';
import { SubCoType } from '../interfaces/subCoType';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { SubcosComponent } from '../../forecast/pages/subcos/subcos.component';
import { FcEntry } from '../interfaces/fcEntry';
import { SummaryData } from '../interfaces/summaryData';
import { UserService } from './user.service';
import { AuthService } from '../security/auth.service';



@Injectable({
  providedIn: 'root',
})
export class SubCoService {

  // subCoPrev$: BehaviorSubject<subCoPreview>;
  // subCoDet$: BehaviorSubject<subCoDetails>;

  subCoPreviews$: BehaviorSubject<subCoPreview[]>;
  // subCoDets$: BehaviorSubject<subCoDetails[]>;
  
  allSubCoPreviews$: BehaviorSubject<subCoPreview[]>;
  allSubCoDetails$: BehaviorSubject<subCoDetails[]>;

  types$: BehaviorSubject<SubCoType[]>;


  /**
   * subCo service constructor
   * @param http
   * @param snackBar
   * @param BO
   * @param pageState
   */
  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
  ) {
    // this.subCoPrev$ = new BehaviorSubject(new subCoPreview);
    this.subCoPreviews$ = new BehaviorSubject([]);
    // this.subCoDet$ = new BehaviorSubject(new subCoDetails);
    this.allSubCoPreviews$ = new BehaviorSubject([]);
    this.allSubCoDetails$ = new BehaviorSubject([]);
    this.types$ = new BehaviorSubject([]);

  }

  /**
   * Loads the current subCo data from the server
   */
  // initSubCoPreview(): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     this.http.get<subCoPreview[]>(this.BO.getSubcoPreviews())
  //       .subscribe((subCo: subCoPreview[]) => {
  //         this.allSubCoPreviews$.next(subCo);
  //         this.addSubCoPreviews(subCo);           
  //         resolve();
  //       }, () => reject());
  //   });
  // }

    /**
   * Loads the current subCo data from the server
   */
    initSubCoPreviewById(emId:number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.http.get<subCoPreview[]>(this.BO.getSubcoPreviewsByEmId(emId))
          .subscribe((subCos: subCoPreview[]) => {
            this.subCoPreviews$.next(subCos);
            // this.addSubCoPreviews(subCos);           
            resolve();
          }, () => reject());
      });
    }

  // initSubCoDetails(): Promise<void> {
  //   return new Promise<void>((resolve, reject) => {
  //     this.http.get<subCoDetails>(this.BO.getSubcoDetails())
  //       .subscribe((subCo: subCoDetails) => {
  //         this.subCoDet$.next(subCo);
  //         this.addSubCoDetails([subCo]);                        
  //         resolve();
  //       }, () => reject());
  //   });
  // }

  /**
   * Loads all subco data from the server
   */
  initializeAllSubCoPreviews(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoPreview[]>(this.BO.getSubcoPreviews())   /* To be implemented yet getSubCosPreview*/
        .subscribe((subCos: subCoPreview[]) => {
          this.allSubCoPreviews$.next(subCos.sort((a, b) => (a.resourceName > b.resourceName) ? 1 : -1));   
          resolve();
        }, () => reject());
    });
  }

  initializeAllSubCoDetails(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoDetails[]>(this.BO.getSubcoDetails()) /* To be implemented yet getSubCosDetails*/
        .subscribe((subCos: subCoDetails[]) => {
          this.allSubCoDetails$.next(subCos.sort((a, b) => (a.resourceName > b.resourceName) ? 1 : -1));  
          resolve();
        }, () => reject());
    });
  }

 
 /**
   * Requests type data from server
   */
  initializeTypes(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<SubCoType[]>(this.BO.getSubCoTypes())   /* To be implemented yet getSubCosTypes*/
        .subscribe((types$: SubCoType[]) => {
          this.types$.next(types$);
          resolve();
        }, () => reject());
    });
  }

  /**
   * Empties subco data
   */
  resetSubCoPreviews(): void {
    this.allSubCoPreviews$.next([]);
    // this.subCoPrev$.next(new subCoPreview());
  }
  resetSubCoDetails(): void {
    this.allSubCoDetails$.next([]);
    // this.subCoDet$.next(new subCoDetails());
  }

  /**
   * returns subCo by a given id
   */
  getSubcoPreview(id: number): subCoPreview | undefined {
    return this.allSubCoPreviews$.getValue().find((u: subCoPreview) => u.subCoId === id);
  }
  getSubcoDetail(id: number): subCoDetails | undefined {
    return this.allSubCoDetails$.getValue().find((u: subCoDetails) => u.subCoId === id);
  }

  /**
   * adds subCo to list 
   */
  addSubCoPreviews(newSubCos: subCoPreview[]): void {
    let subCos: subCoPreview[] = this.allSubCoPreviews$.getValue();
    newSubCos.forEach((u: subCoPreview) => {
      if (!subCos.find((us: subCoPreview) => us.subCoId === u.subCoId)) {
        subCos.push(u);
      }
    });

    this.allSubCoPreviews$.next(subCos);
  }

  addSubCoDetails(newSubCos: subCoDetails[]): void {
    let subCos: subCoDetails[] = this.allSubCoDetails$.getValue();
    newSubCos.forEach((u: subCoDetails) => {
      if (!subCos.find((us: subCoDetails) => us.subCoId === u.subCoId)) {
        subCos.push(u);
      }
    });

    this.allSubCoDetails$.next(subCos);
  }

  //See team-forecast.service:302 setForecastsLockState
  setForecastsLockState(id: number, level: number, locked: boolean): Promise<FcEntry[]> {
    throw new Error("Method not implemented.");
  }

  //See team-forecast.service:56 getTeamForecastPromise
  getForecastPromise(userId: number, id: number, level: number): Promise<FcEntry[]>{
    throw new Error("Method not implemented.");
  }

  //See team-forecast.service:105 getSummaryData
  getSummaryData(fcEntries: FcEntry[], arg1: number, relevantSubcos: subCoDetails[]): SummaryData {
    throw new Error("Method not implemented.");
  }


   /**
   * updates/changes subco 
   */
    updateSubCoPreviews(newSubCos: subCoPreview[]): void {
      let subCos: subCoPreview[] = this.allSubCoPreviews$.getValue();
      var i = 0;
      newSubCos.forEach((u: subCoPreview) => {
        if (subCos.find((us: subCoPreview) => us.subCoId === u.subCoId)) {
           subCos[i].subCoType = u.subCoType;
           subCos[i].subCoTypeId = u.subCoTypeId;
           subCos[i].resourceName = u.resourceName;
        }
        i++;
      });
  
      this.allSubCoPreviews$.next(subCos);
    }
    updateSubCoDetails(newSubCos: subCoDetails[]): void {
      let subCos: subCoDetails[] = this.allSubCoDetails$.getValue();
      var i = 0;
      newSubCos.forEach((u: subCoDetails) => {
        if (subCos.find((us: subCoDetails) => us.subCoId === u.subCoId)) {
          subCos[i].subCoType = u.subCoType;
          subCos[i].subCoTypeId = u.subCoTypeId;
          subCos[i].resourceName = u.resourceName;
          subCos[i].projectId = u.projectId;
          subCos[i].projectName = u.projectName;
          subCos[i].customer = u.customer;
          subCos[i].monthId = u.monthId;
          subCos[i].forecastId = u.forecastId;
          subCos[i].manDay = u.manDay;
          subCos[i].revenue = u.revenue;
          subCos[i].costRate = u.costRate;
          subCos[i].cor = u.cor;
          subCos[i].cost = u.cost;
          subCos[i].contribution = u.contribution;
          subCos[i].cp = u.cp;
          subCos[i].engagamentManagerID = u.engagamentManagerID;
        }
        i++;
      });
  
      this.allSubCoDetails$.next(subCos);
    }

    getSubcoTypes(): SubCoType[] {
      return this.types$.getValue();
    }


}
