import { Component, Inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

/**
 * Customized DateAdapter to show Date in the correct format
 */
export class AppDateAdapter extends NativeDateAdapter {
  /**
   * date format method
   * @param date
   * @param displayFormat
   */
  format(date: Date, displayFormat: Object): string {
      return formatDate(date, 'MMMM yyyy', 'en');
  }
}

/**
 * Month Dialog component for creating + updating months
 */
@Component({
  templateUrl: './add-month.dialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
  ],
  styleUrls: ['../../admin.component.scss'],
}) export class AddMonthDialog {
  /**
   * month form group for create + update
   */
  monthForm: FormGroup;

  /**
   * Initializes month formgroup
   * @param dialogRef
   * @param data
   * @param fb
   */
	constructor(
    public dialogRef: MatDialogRef<AddMonthDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) {
    this.monthForm = this.fb.group({
      id: this.fb.control(data.month.id),
      name: this.fb.control(data.month.name, Validators.required),
      workingdays: this.fb.control(data.month.workingdays, [Validators.required, Validators.min(0), Validators.max(31)]),
      time: this.fb.control(data.month.time, Validators.required),
      active: this.fb.control((typeof data.month.active !== 'undefined') ? data.month.active : true),
    });
  }

  /**
   * Called on 'Cancel' click
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Called on 'Save' click
   */
  onSaveClick(): void {
    this.dialogRef.close(this.monthForm.getRawValue());
  }

  /**
   * Sets form value after datepicker update (when closed after month selection)
   * @param normalizedDate
   * @param datepicker
   */
  chosenMonthHandler(normalizedDate: Date, datepicker: MatDatepicker<any>): void {
    this.monthForm.get('time').setValue(normalizedDate);
    datepicker.close();
  }

  /**
   * Sets form value after datepicker update
   */
  datepickerClosed(): void {
    let date: Date = new Date(this.monthForm.get('time').value);
    date.setDate(1);
    this.monthForm.get('time').setValue(new Date((date.getTime() - (date.getTimezoneOffset() * 60000))).toISOString().slice(0, -5));
  }
}
