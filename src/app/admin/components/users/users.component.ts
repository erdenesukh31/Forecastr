import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { User } from '../../../core/interfaces/user';
import { UserService } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatDialog, MatSort } from '@angular/material';
import { AddUserDialog } from '../../dialogs/add-user/add-user.dialog';
import { Role } from '../../../core/interfaces/role';
import { Grade } from '../../../core/interfaces/grade';
import { UserAdminService } from '../../../core/services/admin/user.service';

/**
 * Component for admin user-list
 */
@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['../../admin.component.scss', './users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  /**
   * sort for angular material table
   */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Defined roles
   */
  roles: Role[];

  /**
   * Defined grades
   */
  grades: Grade[];

  /**
   * User array as MatTableDataSource (needed for auto updates on table)
   */
  user: MatTableDataSource<User>;

  /**
   * user update subscription
   */
  userSubscription: Subscription;

  /**
   * role update subscription
   */
  roleSubscription: Subscription;

  /**
   * grade update subscription
   */
  gradeSubscription: Subscription;

  /**
   * constructor to init user datasource
   * @param dialog
   * @param userService
   */
  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private userAdminService: UserAdminService,
  ) {
    this.user = new MatTableDataSource([]);
  }

  /**
   * init method to load users + roles
   */
  ngOnInit(): void {
    this.userAdminService.initData();

    this.userSubscription = this.userService.allUsers$
      .subscribe((user: User[]) => {
        this.user = new MatTableDataSource(user);
        this.user.sort = this.sort;
      });

    this.roleSubscription = this.userService.roles$
      .subscribe((roles: Role[]) => {
        this.roles = roles;
      });

    this.gradeSubscription = this.userService.grades$
      .subscribe((grades: Grade[]) => {
        this.grades = grades;
      });
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
    this.gradeSubscription.unsubscribe();
  }

  /**
   * open add user dialog
   */
  addNewUser(): void {
    this.openUserDialog(new User());
  }

  /**
   * open update user dialog
   * @param user
   */
  openUserDialog(user: User): void {
    let dialogRef: any = this.dialog.open(AddUserDialog, { height: 'auto', width: '50vw', data: user });

    dialogRef.afterClosed().subscribe((u: User | boolean) => {
      if (u) {
        this.userAdminService.setUser(<User>u);
      }
    });
  }

  /**
   * Update user active state
   * @param id
   * @param active
   */
  setUserActiveState(id: number, active: boolean): void {
    this.userAdminService.setUserActiveState(id, active);
  }

  /**
   * returns user role
   * @param roleId
   */
  getRole(roleId: number): string {
    return this.roles.find((r: Role) => r.roleId === roleId) ? this.roles.find((r: any) => r.roleId === roleId).name : '-';
  }

  /**
   * returns user grade
   * @param gradeId
   */
  getGrade(gradeId: number): string {
    return this.grades.find((g: Grade) => g.gradeId === gradeId) ? this.grades.find((g: Grade) => g.gradeId === gradeId).name : '-';
  }

  /**
   * returns teamlead name
   * @param parentId
   */
  getTeamlead(parentId: number): string {
    let parent: User = this.user.data.find((u: User) => u.id === parentId);
    return parent ? (parent.lastName + ', ' + parent.firstName) : '';
  }
}
