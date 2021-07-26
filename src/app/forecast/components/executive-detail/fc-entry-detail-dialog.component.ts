import { Component, OnInit, Inject } from '@angular/core';
import { VERSION, MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Month } from '../../../core/interfaces/month';

@Component({
  selector: 'app-fc-entry-detail-dialog',
  templateUrl: './fc-entry-detail-dialog.html',
  styleUrls: ["./fc-entry-detail-dialog.component.scss"]
})
export class FcEntryDetailDialogComponent {
  userId: number;
  month: Month;
  months: Month[];
  cancelButtonText = "Done";
  lastName: string;
  firstName: string;
  monthName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FcEntryDetailDialogComponent>) {
    if (data) {
      this.userId = data.userId;
      this.month = data.month;
      this.months = data.months;
      this.monthName = data.month.name;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  monthChanged(event:number){
    this.month = this.months.find( m=> m.id == event);
    this.monthName = this.month.name;
  }

}