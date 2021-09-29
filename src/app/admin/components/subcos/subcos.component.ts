import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { User } from '../../../core/interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialog } from '../../dialogs/add-user/add-user.dialog';
import { UserAdminService } from '../../../core/services/admin/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { subCoPreview } from '../../../core/interfaces/subCoPreview';
import { SubCoService } from '../../../core/services/subCo.service';
import { AddSubcoDialog } from '../../dialogs/add-subco/add-subco.dialog';
@Component({
  selector: 'app-admin-subcos',
  templateUrl: './subcos.component.html',
  styleUrls: ['../../admin.component.scss','./subcos.component.scss']
})
export class SubcosComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Subco array as MatTableDataSource (needed for auto updates on table)
   */
  subco: MatTableDataSource<subCoPreview>;

  /**
   * subco update subscription
   */
   subcoSubscription: Subscription;

  constructor(private dialog: MatDialog,
              private userAdminService: UserAdminService,
              private subcoService: SubCoService) { 
    this.subco = new MatTableDataSource([]);
  }

  ngOnInit(): void {

    //load all subcos
    this.subcoSubscription = this.subcoService.allSubCoPreviews$
      .subscribe((subco: subCoPreview[]) => {
        this.subco = new MatTableDataSource(subco);
        this.subco.sort = this.sort;
      });
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
   ngOnDestroy(): void {
    this.subcoSubscription.unsubscribe();
  }

  /**
   * open add subco dialog
   */
   addNewSubco(): void {
    this.openUserDialog(new subCoPreview());
  } 

  /**
   * open update user dialog
   * @param user
   */
  openUserDialog(subco: subCoPreview): void {
    let dialogRef: any = this.dialog.open(AddSubcoDialog, { height: 'auto', width: '50vw', data: subco });

    dialogRef.afterClosed().subscribe((s: subCoPreview | boolean) => {
      if (s) {
        this.subcoService.setSubco(<subCoPreview>s);
      }
    });
  }

  /**
   * returns subco type
   * @param roleId
   */
   /*getType(typeId: number): string {
    return this.roles.find((r: Role) => r.typeId === typeId) ? this.roles.find((r: any) => r.roleId === roleId).name : '-';
  }*/

}
