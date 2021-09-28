import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { subCoDetails } from '../interfaces/subCoDetails';
import { subCoPreview } from '../interfaces/subCoPreview';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { SubcosComponent } from '../../forecast/pages/subcos/subcos.component';
import { FcEntry } from '../interfaces/fcEntry';
import { SummaryData } from '../interfaces/summaryData';



@Injectable({
  providedIn: 'root',
})
export class SubCoService {
  subCoPrev$: BehaviorSubject<subCoPreview>;
  subCoDet$: BehaviorSubject<subCoDetails>;
  
  allSubCoPreviews$: BehaviorSubject<subCoPreview[]>;
  allSubCoDetails$: BehaviorSubject<subCoDetails[]>;


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
    this.subCoPrev$ = new BehaviorSubject(new subCoPreview)
    this.subCoDet$ = new BehaviorSubject(new subCoDetails)
    this.allSubCoPreviews$ = new BehaviorSubject([])
    this.allSubCoDetails$ = new BehaviorSubject([])
  }

  /**
   * Loads the current subCo data from the server
   */
  initSubCoPreview(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoPreview>(this.BO.getOwnUser())         /* To be implemented yet*/
        .subscribe((subCo: subCoPreview) => {
          this.subCoPrev$.next(subCo);
          this.addSubCoPreviews([subCo]);           
          resolve();
        }, () => reject());
    });
  }

  initSubCoDetails(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoDetails>(this.BO.getOwnUser())  /* To be implemented yet*/
        .subscribe((subCo: subCoDetails) => {
          this.subCoDet$.next(subCo);
          this.addSubCoDetails([subCo]);                        
          resolve();
        }, () => reject());
    });
  }

  /**
   * Loads all subco data from the server
   */
  initializeAllSubCoPreviews(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoPreview[]>(this.BO.getUsers())   /* To be implemented yet*/
        .subscribe((subCos: subCoPreview[]) => {
          this.allSubCoPreviews$.next(subCos.sort((a, b) => (a.resourceName > b.resourceName) ? 1 : -1));    /* sorting ok?*/
          resolve();
        }, () => reject());
    });
  }

  initializeAllSubCoDetails(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<subCoDetails[]>(this.BO.getUsers())
        .subscribe((subCos: subCoDetails[]) => {
          this.allSubCoDetails$.next(subCos.sort((a, b) => (a.resourceName > b.resourceName) ? 1 : -1));    /* sorting ok?*/
          resolve();
        }, () => reject());
    });
  }

 

  /**
   * Empties subco data
   */
  resetSubCoPreviews(): void {
    this.allSubCoPreviews$.next([]);
    this.subCoPrev$.next(new subCoPreview());
  }
  resetSubCoDetails(): void {
    this.allSubCoDetails$.next([]);
    this.subCoDet$.next(new subCoDetails());
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

}
