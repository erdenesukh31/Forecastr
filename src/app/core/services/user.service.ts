import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { Role } from '../interfaces/role';
import { Grade } from '../interfaces/grade';

/**
 * user service
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * observable which contains the current user
   */
  user$: BehaviorSubject<User>;

  /**
   * Observable which contains all users (for admins only)
   */
  allUsers$: BehaviorSubject<User[]>;
  
  /**
   * Observable which contains all possible roles
   */
  roles$: BehaviorSubject<Role[]>;

  /**
   * Observable which contains all possible grades
   */
  grades$: BehaviorSubject<Grade[]>;

  /**
   * user service constructor
   * @param http
   * @param snackBar
   * @param BO
   * @param pageState
   */
  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
  ) {
    this.user$ = new BehaviorSubject(new User());
    this.allUsers$ = new BehaviorSubject([]);
    this.roles$ = new BehaviorSubject([]);
    this.grades$ = new BehaviorSubject([]);
  }

  /**
   * Loads the current user data from the server
   */
  initUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<User>(this.BO.getOwnUser())
        .subscribe((user: User) => {
          this.user$.next(user);
          this.addUsers([user]);
          resolve();
        }, () => reject());
    });
  }

  /**
   * Loads all user data from the server
   */
  initializeAllUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<User[]>(this.BO.getUsers())
        .subscribe((users: User[]) => {
          this.allUsers$.next(users.sort((a, b) => (a.lastName > b.lastName) ? 1 : -1));
          resolve();
        }, () => reject());
    });
  }

  /**
   * Requests role data from server
   */
  initializeRoles(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<any[]>(this.BO.getRoles())
      .subscribe((roles: any[]) => {
        this.roles$.next(roles);
        resolve();
      }, () => reject());
    });
  }

  /**
   * Requests grade data from server
   */
  initializeGrades(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<Grade[]>(this.BO.getGrades())
        .subscribe((grades: Grade[]) => {
          this.grades$.next(grades);
          resolve();
        }, () => reject());
    });
  }

  /**
   * Empties userdata
   * Typically called at logout
   */
  reset(): void {
    this.allUsers$.next([]);
    this.user$.next(new User());
  }

  /**
   * returns user by a given id
   */
  getUser(id: number): User | undefined {
    return this.allUsers$.getValue().find((u: User) => u.id === id);
  }

  addUsers(newUsers: User[]): void {
    let users: User[] = this.allUsers$.getValue();
    newUsers.forEach((u: User) => {
      if (!users.find((us: User) => us.id === u.id)) {
        users.push(u);
      }
    });

    this.allUsers$.next(users);
  }

  getRoleName(rolePermission: number | boolean): string {
    if (rolePermission !== false && this.roles$.getValue().find((role: Role) => role.permissionType === rolePermission)) {
      return this.roles$.getValue().find((role: Role) => role.permissionType === rolePermission).shortcut;
    } else {
      return '';
    }
  }

  /**
   * returns possible grades
   */
  getGrades(): Grade[] {
    return this.grades$.getValue();
  }


  getRole(roleId: number): Role {
    return this.roles$.getValue().find((role: Role) => role.roleId === roleId);
    }
}
