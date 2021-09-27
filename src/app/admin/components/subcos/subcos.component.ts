import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { User } from '../../../core/interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialog } from '../../dialogs/add-user/add-user.dialog';
import { UserAdminService } from '../../../core/services/admin/user.service';
@Component({
  selector: 'app-admin-subcos',
  templateUrl: './subcos.component.html',
  styleUrls: ['../../admin.component.scss','./subcos.component.scss']
})
export class SubcosComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * subcos list
   */

  constructor(private dialog: MatDialog, private userAdminService: UserAdminService) { }

  ngOnInit(): void {
  }

  /**
   * open add subco dialog
   */
   /*addNewSubco(): void {
    this.openUserDialog(new Subco());
  } */

  /**
   * open update user dialog
   * @param user
   */
  /*openUserDialog(user: User): void {
    let dialogRef: any = this.dialog.open(AddUserDialog, { height: 'auto', width: '50vw', data: user });

    dialogRef.afterClosed().subscribe((u: User | boolean) => {
      if (u) {
        this.userAdminService.setUser(<User>u);
      }
    });
  }*/ 

}
