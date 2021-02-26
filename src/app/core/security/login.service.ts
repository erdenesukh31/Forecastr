import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BusinessOperationsService } from '../../core/shared/business-operations.service';
import { AuthService } from './auth.service';
import { UtilitiesService } from '../services/utilities.service';
import { ForecastService } from '../services/forecasts/forecast.service';
import { UserService } from '../services/user.service';
import { TeamUserService } from '../services/forecasts/team-user.service';
import { Location } from '@angular/common';
import { PageStateService } from '../shared/page-state.service';
import { ExecutiveForecastsService } from '../services/forecasts/executive-forecasts.service';

/**
 * login service
 */
@Injectable()
export class LoginService {
  /**
   * set to true when token renew request was already sent, but system is waiting for a response
   */
  tokenRenewActive: boolean = false;

  /**
   * login service constructor
   * 
   * @param router
   * @param location
   * @param BO
   * @param http
   * @param auth
   * @param utilitiesService
   * @param forecastService
   * @param userService
   */
  constructor(
    public router: Router,
    public location: Location,
    private BO: BusinessOperationsService,
    private http: HttpClient,
    private auth: AuthService,
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private userService: UserService,
    private teamService: TeamUserService,
    private executiveService: ExecutiveForecastsService,
    private pageState: PageStateService,
  ) {}

  /**
   * Handles login tasks
   * 
   * @param email
   * @param password
   */
  login(email: string, password: string): Observable<any> {
    let options: any = {
      observe: 'response',
    };

    return this.http.post(
       this.BO.login(),
       {
         email: email,
         password: password,
       },
       options,
     );
  }

  /**
   * Handles logout tasks
   */
  logout(): void {
    this.auth.setLogged(false);
    this.router.navigate(['/login']);

    setTimeout(() => {
      this.deleteData();
    }, 500);
  }

  /**
   * Gets new token from server
   */
  renewToken(): void {
    if (this.auth.getExpireDate() < ((new Date().getTime() / 1000) + 1800) ) {

      if (!this.tokenRenewActive) {
        this.tokenRenewActive = true;
        this.http.get(this.BO.renewToken())
          .subscribe((token: string) => {
            this.auth.useToken('Bearer ' + token);
            this.tokenRenewActive = false;
          });
      }
    }
  }

  /**
   * Deletes all data in services when called.
   * Typically called at logout process.
   */
  deleteData(): void {
    this.userService.reset();
    this.teamService.reset();
    this.utilitiesService.reset();
    this.forecastService.reset();
    this.executiveService.resetSummaryValues();
    this.pageState.resetForecastrReady();
  }
}
