import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { User } from '../../../core/interfaces/user';
import { UserService } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddUserDialog } from '../../dialogs/add-user/add-user.dialog';
import { Role } from '../../../core/interfaces/role';
import { Grade } from '../../../core/interfaces/grade';
import { UserAdminService } from '../../../core/services/admin/user.service';
import { FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
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
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  roleFilter = new FormControl('');
  gradeFilter = new FormControl('');
  teamleadFilter = new FormControl('');
  filterValues : any = {
    name:'', //used for id as well
    teamlead: [],
    role: [],
    grade: []
  }

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


  teamleads: User[];

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
        //getting all teamleads
        let teamleadIDs: number[] = user.filter((u: User) => u.permission >= environment.roles.pdl).map((u: User) => u.id);
        this.teamleads = user.filter((u: User) => teamleadIDs.indexOf(u.id) >= 0);
        this.user = new MatTableDataSource(user);
        this.user.sort = this.sort;
        this.user.filterPredicate = this.createFilter(); // custom filter
        this.applyFilter(this.filterValues.name);
      });

    this.roleSubscription = this.userService.roles$
      .subscribe((roles: Role[]) => {
        this.roles = roles;
      });

    this.gradeSubscription = this.userService.grades$
      .subscribe((grades: Grade[]) => {
        this.grades = grades;
      });

      this.fieldListener();
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


  // Filters
  applyFilter(filterValue) {
    this.filterValues.name = filterValue.trim().toLowerCase();
    this.user.filter = JSON.stringify(this.filterValues);

  }

  private fieldListener() {
    this.roleFilter.valueChanges
      .subscribe(
        roleId => {
          this.filterValues.role = roleId;
          this.user.filter = JSON.stringify(this.filterValues);
        }
      )
    this.gradeFilter.valueChanges
      .subscribe(
        gradeId => {
          this.filterValues.grade = gradeId;
          this.user.filter = JSON.stringify(this.filterValues);
        }
      )
    this.teamleadFilter.valueChanges
      .subscribe(
        teamleadId => {
          this.filterValues.teamlead = teamleadId;
          this.user.filter = JSON.stringify(this.filterValues);
        }
      )
  }

    // custom filter to overwrite the filter predicate
    private createFilter(){
      const filterFunction = function (user: User, filter): boolean {
        //match different filters with user
        let match = true;
        let matchTeamlead = false;
        let matchRole = false;
        let matchGrade = false;
        // User's inputs
        let searchTerms = JSON.parse(filter);

        if(searchTerms.name){
          return (user.firstName.toLowerCase() + user.lastName.toLowerCase() + user.globalId.toString()).split(' ').join('')
          .includes(searchTerms.name);
        } 
        if(searchTerms.teamlead.length>0){
          searchTerms.teamlead.forEach(element => {
            if(element)
                matchTeamlead = matchTeamlead || user.parentId == element;
          });
         match = match && (matchTeamlead);
        }
        if(searchTerms.role.length>0){
          searchTerms.role.forEach(element => {
            if(element)
                matchRole = matchRole || user.roleId == element;
          }); 
          match = match && (matchRole);
        }
        if(searchTerms.grade.length>0){
        searchTerms.grade.forEach(element => {
            if(element != null)
            matchGrade = matchGrade || user.gradeId == element;
          }); 
          match = match && (matchGrade);
        }
        return match;
      }
  
      return filterFunction;
    }

    clearFilter(){
      this.roleFilter.setValue([]);
      this.gradeFilter.setValue([]);
      this.teamleadFilter.setValue([]);
    }
    
}
