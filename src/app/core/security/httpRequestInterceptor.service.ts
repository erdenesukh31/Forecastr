import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from './auth.service';
import { LoginService } from './login.service';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * Request Interceptor for all http requests
 */
@Injectable()
export class HttpRequestInterceptorService implements HttpInterceptor {
  /**
   * necessary service implementations
   * 
   * @param auth
   * @param login
   * @param router
   * @param snackBar
   */
  constructor(
    private injector: Injector,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  /**
   * Method called at every http request
   * 
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth header from the service.
    const authInj= this.injector.get(AuthService);
    const loginInj= this.injector.get(LoginService);
    const authHeader: string = authInj.getToken();
    if (authHeader) {
      let authReq: HttpRequest<any>;
      authReq = req.clone({
        setHeaders: { Authorization: authHeader },
      });

      loginInj.renewToken();
      req = authReq;
    }

    return next.handle(req)
      .pipe(
        catchError((error: HttpErrorResponse, caught: Observable<HttpEvent<any>>) => {
          console.log(error);

          let errorStatus: number = (error.status ? error.status : 0);
          let errorMessage: string = (error && error.error && error.error.error) ? error.error.error : 'An error occured.';

          if (errorStatus === 401) {
            authInj.setLogged(false);
            this.router.navigate(['/login']);
          }

          if (authInj.isLogged()) {
            this.snackBar.open(errorMessage, 'OK', { duration: 10000, });
          }

          return throwError(error);
        })) as any;
  }
}
