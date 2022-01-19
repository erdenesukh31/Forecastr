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

      if (data.subcontractorId !== null) {
        this.subcoForm = this.fb.group({
          subcontractorId: fb.control(data.subcontractorId),
          subcontractorTypeId: fb.control(data.subcontractorTypeId, Validators.required),
          resourceName: fb.control(data.resourceName, Validators.required),
          subcontractorEmId: fb.control(data.subcontractorEmId, Validators.required),
        });
      } else {
        this.subcoForm = this.fb.group({
          subcontractorTypeId: fb.control(data.subcontractorTypeId, Validators.required),
          resourceName: fb.control(data.resourceName, Validators.required),
          subcontractorEmId: fb.control(data.subcontractorEmId, Validators.required),
        });
      }
    }

  ngOnInit(): void {
    this.subcoService.initializeAllSubCoPreviews();
    this.subcoService.initializeTypes();

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
