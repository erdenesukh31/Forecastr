import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

/**
 * Team Dialog component for creating + updating teams
 */
@Component({
	templateUrl: './add-team.dialog.html',
}) export class AddTeamDialog {
  /**
   * project formgroup for create + update
   */
  teamForm: FormGroup;

  /**
   * constructor to initialize project form group
   * @param dialogRef
   * @param data
   * @param fb
   */
  constructor(
    public dialogRef: MatDialogRef<AddTeamDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) {

    this.teamForm = this.fb.group({
      teamId: this.fb.control(data.team.teamId),
      teamLeadId: this.fb.control(data.team.teamLeadId),
      name: this.fb.control(data.team.name, Validators.required),
    });
  }

  /**
   * Called on 'Cancel' click
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Called on 'Save' Click
   */
  onSaveClick(): void {
    this.dialogRef.close(this.teamForm.getRawValue());
  }
}
