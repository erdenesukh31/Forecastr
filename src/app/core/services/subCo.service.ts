import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubCoDetails } from '../interfaces/subCoDetails';
import { SubCoPreview } from '../interfaces/subCoPreview';
import { SubCoType } from '../interfaces/subCoType';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { SubcosComponent } from '../../forecast/pages/subcos/subcos.component';
import { FcEntry } from '../interfaces/fcEntry';
import { SummaryData } from '../interfaces/summaryData';
import { UserService } from './user.service';
import { AuthService } from '../security/auth.service';
import { SubcoSummaryData } from '../interfaces/subcoSummaryData';
import { FcProject } from '../interfaces/fcProject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageStateService } from '../shared/page-state.service';



@Injectable({
  providedIn: 'root',
})
export class SubCoService {

  // subCoPrev$: BehaviorSubject<subCoPreview>;
  // subCoDet$: BehaviorSubject<subCoDetails>;

  subCoPreviews$: BehaviorSubject<SubCoPreview[]>;
  // subCoDets$: BehaviorSubject<subCoDetails[]>;
  
  allSubCoPreviews$: BehaviorSubject<SubCoPreview[]>;
  allSubCoDetails$: BehaviorSubject<SubCoDetails[]>;

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
    private snackBar: MatSnackBar,
    private pageState: PageStateService
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
        this.http.get<SubCoDetails[]>(this.BO.getSubcoPreviewsByEmId(emId))
          .subscribe((subCos: SubCoDetails[]) => {
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
      this.http.get<SubCoPreview[]>(this.BO.getSubcoPreviews())   /* To be implemented yet getSubCosPreview*/
        .subscribe((subCos: SubCoPreview[]) => {
          this.allSubCoPreviews$.next(subCos.sort((a, b) => (a.resourceName > b.resourceName) ? 1 : -1));   
          resolve();
        }, () => reject());
    });
  }

  initializeAllSubCoDetails(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<SubCoDetails[]>(this.BO.getSubcoDetails()) /* To be implemented yet getSubCosDetails*/
        .subscribe((subCos: SubCoDetails[]) => {
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
  getSubcoPreview(id: number): SubCoPreview | undefined {
    return this.allSubCoPreviews$.getValue().find((u: SubCoPreview) => u.subcontractorId === id);
  }
  getSubcoDetail(id: number): SubCoDetails | undefined {
    return this.allSubCoDetails$.getValue().find((u: SubCoDetails) => u.subcontractorId === id);
  }

  /**
   * Adds subco to subco-list
   * @param subco
   */
   addSubco(subco: SubCoPreview): void {
    let subcos: SubCoPreview[] = this.allSubCoPreviews$.getValue();
    subcos = subcos.filter((s: SubCoPreview) => s.subcontractorId !== subco.subcontractorId);
    subcos.push(subco);

    this.allSubCoPreviews$.next(subcos);
  }

  /**
   * adds subCo to list 
   */
  addSubCoPreviews(newSubCos: SubCoPreview[]): void {
    let subCos: SubCoPreview[] = this.allSubCoPreviews$.getValue();
    newSubCos.forEach((u: SubCoPreview) => {
      if (!subCos.find((us: SubCoPreview) => us.subcontractorId === u.subcontractorId)) {
        subCos.push(u);
      }
    });

    this.allSubCoPreviews$.next(subCos);
  }

  addSubCoDetails(newSubCos: SubCoDetails[]): void {
    let subCos: SubCoDetails[] = this.allSubCoDetails$.getValue();
    newSubCos.forEach((u: SubCoDetails) => {
      if (!subCos.find((us: SubCoDetails) => us.subcontractorId === u.subcontractorId)) {
        subCos.push(u);
      }
    });

    this.allSubCoDetails$.next(subCos);
  }

  //See team-forecast.service:302 setForecastsLockState
  // setForecastsLockState(monthId: number, emId:number, lockState: boolean): Promise<FcEntry[]> {
  //   return new Promise<any>((resolve: any, reject: any) => {
  //     this.http.put(this.BO.setSubcoForecastUnlocked(monthId, emId), { lockState: lockState })
  //     .subscribe((forecasts: FcEntry[]) => {
  //       resolve(forecasts);
  //     }, (e: any) => {
  //       reject();
  //     });
  //   });
  // }

  // See team-forecast.service:56 getTeamForecastPromise
  getForecastPromise(userId: number, id: number, level: number): Promise<FcEntry[]>{
    throw new Error("Method not implemented.");
  }

  //See team-forecast.service:105 getSummaryData
  getSummaryData(subcos: SubCoDetails[]): SubcoSummaryData {
    let summaryData: SubcoSummaryData = {
      revenue: 0,
      cost: 0,
      contribution : 0,
      cp: 0,
    }

    subcos.forEach(sub =>{
      let revenue:number;
      let cost:number;
      let contribution:number;
      summaryData.revenue += revenue = sub.cor * sub.manDay;
      summaryData.cost += cost = sub.costRate * sub.manDay;
      summaryData.contribution += contribution = revenue - cost;
      summaryData.cp += contribution / revenue; //TODO: check if correct
    });
    return summaryData;
  }

  /**
   * Updates subco in subco-list
   * @param subco
   */
   editSubco(subco: SubCoPreview): void {
    let subcos: SubCoPreview[] = this.allSubCoPreviews$.getValue();
    subcos
      .filter((s: SubCoPreview) => s.subcontractorId === subco.subcontractorId)
      .forEach((s: SubCoPreview) => {
        s.subcontractorTypeName = subco.subcontractorTypeName;
        s.resourceName = subco.resourceName;
      });

    this.allSubCoPreviews$.next(subcos);
  }


   /**
   * updates/changes subco 
   */
    updateSubCoPreviews(newSubCos: SubCoPreview[]): void {
      let subCos: SubCoPreview[] = this.allSubCoPreviews$.getValue();
      var i = 0;
      newSubCos.forEach((u: SubCoPreview) => {
        if (subCos.find((us: SubCoPreview) => us.subcontractorId === u.subcontractorId)) {
           subCos[i].subcontractorTypeName = u.subcontractorTypeName;
           subCos[i].subcontractorTypeId = u.subcontractorTypeId;
           subCos[i].resourceName = u.resourceName;
        }
        i++;
      });
  
      this.allSubCoPreviews$.next(subCos);
    }
    
    updateSubCoDetails(newSubCos: SubCoDetails[]): void {
      let subCos: SubCoDetails[] = this.allSubCoDetails$.getValue();
      var i = 0;
      newSubCos.forEach((u: SubCoDetails) => {
        if (subCos.find((us: SubCoDetails) => us.subcontractorId === u.subcontractorId)) {
          subCos[i].subcontractorTypeName = u.subcontractorTypeName;
          subCos[i].subcontractorTypeId = u.subcontractorTypeId;
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
          subCos[i].engagementManagerId = u.engagementManagerId;
        }
        i++;
      });
  
      this.allSubCoDetails$.next(subCos);
    }

    getSubcoTypes(): SubCoType[] {
      return this.types$.getValue();
    }

    /**
   * Calls add or edit subco request to server
   * @param subco
   */
  setSubco(subco: SubCoPreview): void {
    if (subco.subcontractorId) {
      this.http.put(this.BO.updateSubCoPreview(subco.subcontractorId), subco).subscribe(
        (s: SubCoPreview) => {
          this.editSubco(s);
          this.snackBar.open("Subco successfully saved!", "OK", {
            duration: 5000,
          });
          this.pageState.hideSpinner();
        },
        (e: any) => {
          this.snackBar.open("Subco could not be saved!", "OK", {
            duration: 10000,
          });
          this.pageState.hideSpinner();
        }
      );
    } else {
      this.http.post(this.BO.createUser(), subco).subscribe(
        (s: SubCoPreview) => {
          this.addSubco(s);
          this.snackBar.open("Subco successfully added!", "OK", {
            duration: 5000,
          });
          this.pageState.hideSpinner();
        },
        (e: any) => {
          this.snackBar.open("Subco could not be added!", "OK", {
            duration: 10000,
          });
          this.pageState.hideSpinner();
        }
      );
    }
  }


}
