import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * spinner-service
 */
@Injectable({
  providedIn: 'root',
})
export class PageStateService {
  /**
   * Observable which contains the current spinner value (boolean)
   */
  spinner$: BehaviorSubject<boolean>;
  forecastrReady$: BehaviorSubject<boolean>;

  /**
   * spinner-service constructor
   */
  constructor(
  ) {
    this.forecastrReady$ = new BehaviorSubject(false);
    this.spinner$ = new BehaviorSubject(true);
  }

  /**
   * Sets spinner active when called
   */
  showSpinner(): void {
    this.spinner$.next(true);
  }

  /**
   * Sets spinner inactive when called
   */
  hideSpinner(): void {
    this.spinner$.next(false);
  }

  setForecastrReady(): void {
    this.forecastrReady$.next(true);
  }

  resetForecastrReady(): void {
    this.forecastrReady$.next(false);
  }
}
