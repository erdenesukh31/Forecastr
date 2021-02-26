import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment as env } from '../../../environments/environment';
import * as jwt_decode from 'jwt-decode';

/**
 * Handles token authentication
 */
@Injectable()
export class AuthService {

  /**
   * Locked state
   */
  private logged: boolean = false;

  /**
   * JWT token
   */
  private token: string;

  /**
   * userId (extracted from token)
   */
  private userId: number;

  /**
   * roleid [updated role variable] (extracted from token)
   */
  private roleId: number;

  /**
   * token expire date (extracted from token)
   */
  private expireDate: number;

  /**
   * user isAdmin flag (extracted from token)
   */
  private admin: boolean;

  /**
   * getstated (extracted from token)
   * true if user loggs in the first time or hasn't logged in for 2 months
   */
  private getstarted: boolean = false;

  /**
   * timeout which triggers when token expires
   */
  private loginScreenTimeout: any;

  /**
   * constructor for router
   */
  constructor(private router: Router) {}

  /**
   * Test if user is logged in
   */
  public isLogged(): boolean {
    if (!this.logged && localStorage.getItem('v-token')) {
      return this.useToken(localStorage.getItem('v-token'));
    } else {
      return this.logged || false;
    }
  }

  /**
   * Apply token and set auth variables if token is valid. 
   * Otherwise: set logged in to false.
   * @param token
   */
  public useToken(token: string): boolean {
    if (this.loginScreenTimeout) {
      clearTimeout(this.loginScreenTimeout);
    }
    try {
      const tokenContent: any = jwt_decode(token);
      //console.log(tokenContent);

      const time: number = tokenContent.exp - (new Date().getTime() / 1000);

      if (time < 0) {
        this.setToken('');
        this.setLogged(false);

        return false;
      } else {
        this.loginScreenTimeout = setTimeout(() => {
          this.router.navigate(['/login']);
          this.setToken('');
          this.setLogged(false);
        }, (time * 1000));
      }

      this.setUserId(tokenContent.userId);
      this.setRoleId(tokenContent.permission);
      this.setExpireDate(tokenContent.exp);
      this.setAdminPermission(tokenContent.admin ? tokenContent.admin : false);
      this.setLogged(true);
      this.setToken(token);

      return true;
    } catch (e) {
        this.setToken('');
        this.setLogged(false);

        return false;
    }
  }

  /**
   * set logged state
   * if logged false: set token to empty string
   * @param login
   */
  public setLogged(login: boolean): void {
    this.logged = login;

    if (!this.logged) {
      this.setToken('');
    }
  }

  /**
   * Tests if user has a specific role
   * Role has to be equal or more powerful than expected role
   * Roles: CSS: Client Serving Staff, PDL: People Development Lead, TL: Team Lead, PL: Practice Lead, MSL: Market Segment Lead, FC: Financial Controller
   * @param expectedRole
   */
  public hasRole(expectedRole: number): boolean {
    if (expectedRole === env.roles.admin) {
      return this.hasAdminPermission();
    } else if (expectedRole <= this.roleId) {
      return true;
    }

    return false;
  }

  public setGetStarted(getstarted: boolean): void {
    this.getstarted = getstarted;
  }

  public showGetStarted(): boolean {
    if (this.getstarted) {
      this.getstarted = false;
      return true;
    }

    return false;
  }

  /**
   * get user id
   */
  public getUserId(): number {
    return this.userId;
  }

  /**
   * get role id
   */
  public getRoleId(): number {
    return this.roleId;
  }

  /**
   * get token expire date
   */
  public getExpireDate(): number {
    return this.expireDate;
  }

  /**
   * get token
   */
  public getToken(): string {
    return this.token;
  }

  /**
   * get admin permission flag
   */
  private hasAdminPermission(): boolean {
    return this.admin;
  }

  /**
   * set user id
   * @param id
   */
  private setUserId(id: number): void {
    this.userId = id;
  }

  /**
   * set role id
   * @param id
   */
  private setRoleId(id: number): void {
    this.roleId = id;
  }

  /**
   * set token expire date
   * @param expireDate
   */
  private setExpireDate(expireDate: number): void {
    this.expireDate = expireDate;
  }

  /**
   * set admin permission flag
   * @param admin
   */
  private setAdminPermission(admin: boolean): void {
    this.admin = admin;
  }

  /**
   * set token (variable + localstorage)
   * @param token
   */
  private setToken(token: string): void {
    localStorage.setItem('v-token', token);
    this.token = token;
  }
}
