import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { User } from '../../../core/interfaces/user';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialog } from '../../dialogs/add-user/add-user.dialog';
import { UserAdminService } from '../../../core/services/admin/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { SubCoPreview } from '../../../core/interfaces/subCoPreview';
import { SubCoService } from '../../../core/services/subCo.service';
import { AddSubcoDialog } from '../../dialogs/add-subco/add-subco.dialog';
import { SubCoType } from '../../../core/interfaces/subCoType';
import { FormControl } from '@angular/forms';

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
  subco: MatTableDataSource<SubCoPreview>;

  /**
   * subco update subscription
   */
   subcoSubscription: Subscription;

  /**
    * subco types subscription
    */
   typeSubscription: Subscription;

   /**
     * list of types (for type select)
     */
    types: SubCoType[];

    engagementManagerIds: Number[];
    engagementManagerName: String[];

    subCoTypeFilter = new FormControl('');
    managerFilter = new FormControl('');
    filterValues : any = {
      name:'',
      type: [],
      enManager:[]
    }

  constructor(private dialog: MatDialog,
              private userAdminService: UserAdminService,
              private subcoService: SubCoService) { 
    this.subco = new MatTableDataSource([]);
  }

  ngOnInit(): void {
    this.subcoService.initializeAllSubCoPreviews();
    this.subcoService.initializeTypes();
    this.subcoService.initializeAllEngagamentManager();
    //load all subcos
    this.subcoSubscription = this.subcoService.allSubCoPreviews$
      .subscribe((subco: SubCoPreview[]) => {
        this.subco = new MatTableDataSource(subco);
        this.engagementManagerName = [...new Set(subco.map(item => item.subcontractorEngagementManager))];
        this.subco.filterPredicate = this.createFilter();
        this.subco.sort = this.sort;
      });

    this.typeSubscription = this.subcoService.types$
        .subscribe((types: SubCoType[]) => {
          this.types = types;
        }); 
    
    this.fieldListener();
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
    this.openUserDialog(new SubCoPreview());
  } 

  /**
   * open update user dialog
   * @param user
   */
  openUserDialog(subco: SubCoPreview): void {
    let dialogRef: any = this.dialog.open(AddSubcoDialog, { height: 'auto', width: '50vw', data: subco });

    dialogRef.afterClosed().subscribe((s: SubCoPreview | boolean) => {
      if (s) {
        this.subcoService.setSubco(<SubCoPreview>s);
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

  // Filters
  applyFilter(filterValue) {
    this.filterValues.name = filterValue.trim().toLowerCase();
    this.subco.filter = JSON.stringify(this.filterValues);
  }
  private fieldListener() {
    this.subCoTypeFilter.valueChanges
      .subscribe(
        type => {
          this.filterValues.type = type;
          this.subco.filter = JSON.stringify(this.filterValues);
        }
      );
      this.managerFilter.valueChanges
      .subscribe(
        id => {
          this.filterValues.enManager = id;
          this.subco.filter = JSON.stringify(this.filterValues);
        }
      )
  }
    // custom filter to overwrite the filter predicate
    private createFilter(){
      const filterFunction = function (subco: SubCoPreview, filter): boolean {
        //match different filters with user
        let match = true;
        let matchType= false;
        let matchManager= false;
        // User's inputs
        let searchTerms = JSON.parse(filter);
        if(searchTerms.name){
          return (subco.resourceName.toLowerCase()).split(' ').join('')
          .includes(searchTerms.name);
        } 
        if(searchTerms.type.length>0){
          searchTerms.type.forEach(element => {
            if(element)
                matchType = matchType || subco.subcontractorTypeId == element;
          });
          match = match && (matchType);
        }
        if(searchTerms.enManager.length>0){
          searchTerms.enManager.forEach(element => {
            if(element)
                matchManager = matchManager || subco.subcontractorEngagementManager == element;
          });
         match = match && (matchManager);
        }
        return match;
      }
  
      return filterFunction;
    }

    clearFilter(){
      this.subCoTypeFilter.setValue([]);
      this.managerFilter.setValue([]);
    }


}
