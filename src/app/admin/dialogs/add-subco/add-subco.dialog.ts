import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { User } from "../../../core/interfaces/user";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { subCoPreview } from '../../../core/interfaces/subCoPreview';
import { Subscription } from 'rxjs';
import { SubCoService } from '../../../core/services/subCo.service';

@Component({
  templateUrl: './add-subco.dialog.html',
  styleUrls: ['./add-subco.dialog.scss']
})
export class AddSubcoDialog implements OnInit, OnDestroy {

  //TODO: put here subco list
  //users: Subco[];
  /**
    * subco formgroup for create + update
    */
  subcoForm: FormGroup;

  /**
    * subco list subscription
    */
  subcoSubscription: Subscription;

  /**
    * subco list subscription
    */
  typeSubscription: Subscription;

  /**
    * list of user (for teamlead select)
   */
  subco: subCoPreview[];

  constructor(public dialogRef: MatDialogRef<AddSubcoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: subCoPreview,
    private subcoService: SubCoService,
    private fb: FormBuilder) { 

      if (typeof data.subCoId !== 'undefined') {
        this.subcoForm = this.fb.group({
          id: fb.control(data.subCoId),
          type: fb.control(data.subCoType, Validators.required),
          name: fb.control(data.resourceName, Validators.required)
        });
      } else {
        this.subcoForm = this.fb.group({
          type: fb.control(data.subCoType, Validators.required),
          name: fb.control(data.resourceName, Validators.required)
        });
      }
    }

  ngOnInit(): void {
    this.subcoSubscription = this.subcoService.allSubCoPreviews$
        .subscribe((subco: subCoPreview[]) => {
          this.subco = subco;
        });

      /*this.typeSubscription = this.subcoService.roles$
        .subscribe((roles: Role[]) => {
          this.roles = roles;                //get the subco types
        }); */
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
    this.dialogRef.close(this.subcoForm.getRawValue());
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.subcoSubscription.unsubscribe();
    this.typeSubscription.unsubscribe();
  }

}
