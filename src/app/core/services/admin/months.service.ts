import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

import { Month } from '../../interfaces/month';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { PageStateService } from '../../shared/page-state.service';

/**
 * months service
 */
@Injectable({
  providedIn: 'root',
})
export class MonthService {
  /**
   * Observable which contains all months
   */
  months$: BehaviorSubject<Month[]>;

  /**
   * utilities service constructor
   * 
   * @param http
   * @param BO
   * @param pageState
   */
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    private pageState: PageStateService,
  ) {
    this.months$ = new BehaviorSubject([]);
  }

  /**
   * Initializes months
   */
  initializeMonths(): void {
    this.http.get(this.BO.getAdminMonths()).subscribe((months: Month[]) => {
      this.months$.next(months.sort((a, b) => (a.time > b.time) ? 1 : -1));
    });
  }

  addMonth(month: Month): void {
    let months: Month[] = this.months$.getValue();
    months = months.filter((p: Month) => p.id !== month.id);
    months.push(month);

    this.months$.next(months);
  }

  getLockedMonths(): Observable<any> {
    return this.http.get(this.BO.getLockedMonths());
  }
  
  getSavedMonths(): Observable<any> {
    return this.http.get(this.BO.getSavedMonths());
  }

  /**
   * Empties month-data
   * Typically called at logout
   */
  reset(): void {
    this.months$.next([]);
  }

  /**
   * returns all months
   */
  getMonths(): Month[] {
    return this.months$.getValue();
  }

	/**
   * Update or create month
   * @param month 
   */
  setMonth(month: Month): void {
    this.http.put(this.BO.setMonths(), month)
      .subscribe((m: Month) => {
        this.addMonth(m);
        this.snackBar.open('Month successfully saved!', 'OK', { duration: 5000, });
        this.pageState.hideSpinner();

      }, (e: any) => {
        this.snackBar.open('Month could not be saved!', 'OK', { duration: 10000, });
        this.pageState.hideSpinner();

      });
  }

  /**
   * 
   */
  setMonthActiveState(id: number, state: boolean): void {
    this.http.put(this.BO.setMonthState(), {id: id, active: state })
      .subscribe((m: Month) => {
        this.addMonth(m);
      });
  }
}
