import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { User } from "../../../core/interfaces/user";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SubCoPreview } from '../../../core/interfaces/subCoPreview';
import { Subscription } from 'rxjs';
import { SubCoService } from '../../../core/services/subCo.service';
import { SubCoType } from '../../../core/interfaces/subCoType';

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
  subco: SubCoPreview[];

  /**
     * list of types (for type select)
     */
   types: SubCoType[];

  constructor(public dialogRef: MatDialogRef<AddSubcoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SubCoPreview,
    private subcoService: SubCoService,
    private fb: FormBuilder) { 

      if (typeof data.subcontractorId !== 'undefined') {
        this.subcoForm = this.fb.group({
          id: fb.control(data.subcontractorId),
          type: fb.control(data.subcontractorTypeName, Validators.required),
          name: fb.control(data.resourceName, Validators.required)
        });
      } else {
        this.subcoForm = this.fb.group({
          type: fb.control(data.subcontractorTypeName, Validators.required),
          name: fb.control(data.resourceName, Validators.required)
        });
      }
    }

  ngOnInit(): void {
    this.subcoSubscription = this.subcoService.allSubCoPreviews$
        .subscribe((subco: SubCoPreview[]) => {
          this.subco = subco;
        });

      this.typeSubscription = this.subcoService.types$
        .subscribe((types: SubCoType[]) => {
          this.types = types;     
        }); 
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
