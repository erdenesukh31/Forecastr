import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { User } from "../../../core/interfaces/user";
import { UserService } from "../../../core/services/user.service";
import { Subscription } from "rxjs";
import { Role } from "../../../core/interfaces/role";
import { Grade } from "../../../core/interfaces/grade";
import { environment } from "../../../../environments/environment.prod";

/**
 * user dialog component for creating + updating users
 */
@Component({
    templateUrl: './add-user.dialog.html',
    styleUrls: ['./add-user.dialog.scss'],
})
export class AddUserDialog implements OnInit, OnDestroy {
    /**
     * user formgroup for create + update
     */
    userForm: FormGroup;

    /**
     * user list subscription
     */
    userSubscription: Subscription;

    /**
     * role list subscription
     */
    roleSubscription: Subscription;

    /**
     * grade list subscription
     */
    gradeSubscription: Subscription;

    /**
     * list of user (for teamlead select)
     */
    user: User[];

    /**
     * list of roles (for role select)
     */
    roles: Role[];

    /**
     * list of grades (for grade select)
     */
    grades: Grade[];

    /**
     * initializes user formgroup
     * create user: without id, with password
     * update user: with id, without password
     * @param dialogRef
     * @param data
     * @param userService
     * @param fb
     */
    constructor(
        public dialogRef: MatDialogRef<AddUserDialog>,
        @Inject(MAT_DIALOG_DATA) public data: User,
        private userService: UserService,
        private fb: FormBuilder,
    ) {

      if (typeof data.id !== 'undefined') {
        this.userForm = this.fb.group({
          id: fb.control(data.id),
          globalId: fb.control(data.globalId, Validators.required),
          firstName: fb.control(data.firstName, Validators.required),
          lastName: fb.control(data.lastName, Validators.required),
          email: fb.control(data.email, [
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'), Validators.email,
          ]),
          fte: fb.control(data.fte, [Validators.required, Validators.max(1), Validators.min(0)]),
          roleId: fb.control(data.roleId, Validators.required),
          gradeId: fb.control(data.gradeId, Validators.required),
          parentId: fb.control(data.parentId),
          admin: fb.control(data.admin, Validators.required),
          active: fb.control((typeof data.active !== 'undefined') ? data.active : true),
          startDate: fb.control(data.startDate),
          endDate: fb.control(data.endDate),
        });
      } else {
        this.userForm = this.fb.group({
          globalId: fb.control(data.globalId, Validators.required),
          firstName: fb.control(data.firstName, Validators.required),
          lastName: fb.control(data.lastName, Validators.required),
          email: fb.control(data.email, [
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'), Validators.email,
          ]),
          password: fb.control(data.password, Validators.required),
          fte: fb.control(data.fte, [Validators.required, Validators.max(1), Validators.min(0)]),
          roleId: fb.control(data.roleId, Validators.required),
          gradeId: fb.control(data.gradeId, Validators.required),
          parentId: fb.control(data.parentId),
          admin: fb.control(data.admin, Validators.required),
          active: fb.control((typeof data.active !== 'undefined') ? data.active : true),
          startDate: fb.control(data.startDate),
          endDate: fb.control(data.endDate),
        });
      }
    }

    /**
     * Initializes user + role subscriptions
     */
    ngOnInit(): void {
      this.userSubscription = this.userService.allUsers$
        .subscribe((user: User[]) => {
          this.user = user;
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

    getTeamleads(): User[] {
      let role: Role = this.roles.find((r: Role) => r.roleId === this.userForm.value.roleId);
      let permission: any = environment.roles.pdl;
      if (role) {
        permission = role.permissionType;
      }
      return this.user.filter((u: User) => this.roles.find((r: Role) => r.roleId === u.roleId).permissionType > permission);
    }

    roleUpdate(): void {
      let role: Role = this.roles.find((r: Role) => r.roleId === this.userForm.value.roleId);

      if (role && role.permissionType >= environment.roles.fc) {
       this.userForm.get('admin').setValue(true);
        this.userForm.get('admin').disable();
      } else {
        this.userForm.get('admin').enable();
      }
    }

    /**
     * Called on 'Cancel' click
     */
    onCancelClick(): void {
      this.dialogRef.close(false);
    }

    /**
     * Called on 'Save' click
     */
    onSaveClick(): void {
      this.dialogRef.close(this.userForm.getRawValue());
    }

    /**
     * Unsubscribe services when component gets destroyed
     */
    ngOnDestroy(): void {
      this.userSubscription.unsubscribe();
      this.roleSubscription.unsubscribe();
      this.gradeSubscription.unsubscribe();
    }

    datepickerClosed(start: boolean): void {
      if(start == true) {
        let date: Date = new Date(this.userForm.get('startDate').value);
        this.userForm.get('startDate').setValue(new Date((date.getTime() - (date.getTimezoneOffset() * 60000))).toISOString().slice(0, -5));
      } else {
        let date: Date = new Date(this.userForm.get('endDate').value);
        this.userForm.get('endDate').setValue(new Date((date.getTime() - (date.getTimezoneOffset() * 60000))).toISOString().slice(0, -5));        
      }
    }
}
