import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubCoFcIntExt } from '../interfaces/subCoFcIntExt';
import { SubCoFcOffshore } from '../interfaces/subCoFcOffshore';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { FcEntry } from '../interfaces/fcEntry';
import { SubcoSummaryData } from '../interfaces/subcoSummaryData';
import { FcProject } from '../interfaces/fcProject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageStateService } from '../shared/page-state.service';


@Injectable({
  providedIn: 'root',
})
export class SubCoFinancialControllerService {

  intExtSubCo$: BehaviorSubject<SubCoFcIntExt[]>;
  offshoreSubCo$: BehaviorSubject<SubCoFcOffshore[]>

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
    this.intExtSubCo$ = new BehaviorSubject([]);
    this.offshoreSubCo$ = new BehaviorSubject(null);
  }

  /**
   * Loads the current internal subCo  data from the server
   */
    initSubCoInternalForMonth(monthId:number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.http.get<SubCoFcIntExt[]>(this.BO.getSubCoInternalForMonth(monthId))   //WIP in Business Operations --> add Endpoint
          .subscribe((subCos: SubCoFcIntExt[]) => {
            this.intExtSubCo$.next(subCos);
            resolve();
          }, () => reject());
      });
    }
  /**
   * Loads the current external subCo data from the server
   */
   initSubCoExternalForMonth(monthId:number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<SubCoFcIntExt[]>(this.BO.getSubCoExternalForMonth(monthId))   //WIP in Business Operations --> add Endpoint
        .subscribe((subCos: SubCoFcIntExt[]) => {
          this.intExtSubCo$.next(subCos);
          resolve();
        }, () => reject());
    });
  }
   /**
   * Loads the current offshore subCo data from the server
   */
    initSubCoOffshoreForMonth(monthId:number): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.http.get<SubCoFcOffshore[]>(this.BO.getSubCoOffshoreForMonth(monthId))   //WIP in Business Operations --> add Endpoint
          .subscribe((subCos: SubCoFcOffshore[]) => {
            this.offshoreSubCo$.next(subCos);
            resolve();
          }, () => reject());
      });
    }

 

}
