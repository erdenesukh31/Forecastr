import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Tests if user is authenticated and fulfills specific role criteria
 */
@Injectable()
export class RoleGuard implements CanActivate {
  /**
   * needs auth + route services
   */
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  /**
   * If user is logged in and is allowed to access page with his role: returns true.
   * Otherwise: returns false. Additionally navigates to login page if user is not logged in at all.
   * 
   * @param route 
   * @param state 
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLogged()) {
      const expectedRole: number = route.data.expectedRole;
      if (this.authService.hasRole(expectedRole)) {
        return true;
      }

      this.router.navigate(['/']);
      return false;
    }

    if (this.router.url === '/') {
      this.router.navigate(['/login']);
    }

    return false;
  }
}
