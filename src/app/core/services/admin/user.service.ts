import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { MatSnackBar } from '@angular/material';
import { PageStateService } from '../../shared/page-state.service';
import { UserService } from '../user.service';

/**
 * user service
 */
@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  /**
   * user service constructor
   * @param http
   * @param snackBar
   * @param BO
   * @param pageState
   */
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    private pageState: PageStateService,
    private userService: UserService,
  ) {}

  /**
   * init user service data
   */
  initData(): void {
    this.userService.initializeAllUser().then(() => {
      this.userService.initializeRoles();
      this.userService.initializeGrades();    
    });
  }

  /**
   * Adds user to user-list
   * @param user
   */
  addUser(user: User): void {
    let users: User[] = this.userService.allUsers$.getValue();
    users = users.filter((u: User) => u.id !== user.id);
    users.push(user);

    this.userService.allUsers$.next(users);
  }

  /**
   * Updates user in user-list
   * @param user
   */
  editUser(user: User): void {
    let users: User[] = this.userService.allUsers$.getValue();
    users
      .filter((u: User) => u.id === user.id)
      .forEach((u: User) => {
        u.globalId = user.globalId;
        u.firstName = user.firstName;
        u.lastName = user.lastName;
        u.email = user.email;
        u.roleId = user.roleId;
        u.gradeId = user.gradeId;
        u.parentId = user.parentId;
        u.fte = user.fte;
        u.admin = user.admin;
      });

    this.userService.allUsers$.next(users);
  }

  /**
   * Calls add or edit user request to server
   * @param user
   */
  setUser(user: User): void {
    if (user.id) {
      this.http.put(this.BO.updateUser(user.id), user).subscribe(
        (u: User) => {
          this.editUser(u);
          this.snackBar.open("User successfully saved!", "OK", {
            duration: 5000,
          });
          this.pageState.hideSpinner();
        },
        (e: any) => {
          this.snackBar.open("User could not be saved!", "OK", {
            duration: 10000,
          });
          this.pageState.hideSpinner();
        }
      );
    } else {
      this.http.post(this.BO.createUser(), user).subscribe(
        (u: User) => {
          this.addUser(u);
          this.snackBar.open("User successfully added!", "OK", {
            duration: 5000,
          });
          this.pageState.hideSpinner();
        },
        (e: any) => {
          this.snackBar.open("User could not be added!", "OK", {
            duration: 10000,
          });
          this.pageState.hideSpinner();
        }
      );
    }
  }

  /**
   * Calls set active state request to server
   * @param id
   * @param state
   */
  setUserActiveState(id: number, state: boolean): void {
    this.http
      .put(this.BO.setUserState(id), { id: id, active: state })
      .subscribe(() => {
        let users: User[] = this.userService.allUsers$.getValue();
        users
          .filter((u: User) => u.id === id)
          .forEach((u: User) => {
            u.active = state;
          });

        this.userService.allUsers$.next(users);
      });
  }
}
