import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

/**
 * Project Dialog component for creating + updating projects
 */
@Component({
	templateUrl: './add-project.dialog.html',
}) export class AddProjectDialog {
  /**
   * project formgroup for create + update
   */
  projectForm: FormGroup;
  projectTypes: any;

  /**
   * constructor to initialize project form group
   * @param dialogRef
   * @param data
   * @param fb
   */
  constructor(
    public dialogRef: MatDialogRef<AddProjectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) {
    this.projectTypes = environment.projectTypes;

    this.projectForm = this.fb.group({
      id: this.fb.control(data.project.id),
      code: this.fb.control(data.project.code),
      name: this.fb.control(data.project.name, Validators.required),
      mandatory: this.fb.control(data.project.mandatory, Validators.required),
      billable: this.fb.control((typeof data.project.billable !== 'undefined' ? data.project.billable : true), Validators.required),
      projectType: this.fb.control(data.project.projectType, Validators.required),
      active: this.fb.control((typeof data.project.active !== 'undefined') ? data.project.active : true),
    });

    if (data.project.projectType === 4 || data.project.projectType === 5) {
      this.projectForm.get('billable').disable();
    }
  }

  onProjectTypeUpdate(): void {
    if (this.projectForm.get('projectType').value === 4 || this.projectForm.get('projectType').value === 5) {
      this.projectForm.get('billable').setValue(false);
      this.projectForm.get('billable').disable();
    } else {
      this.projectForm.get('billable').enable();
    }
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
    this.dialogRef.close(this.projectForm.getRawValue());
  }
}
