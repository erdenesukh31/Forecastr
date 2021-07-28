import { Component, OnInit, Inject } from '@angular/core';
import { VERSION } from '@angular/material/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Month } from '../../../core/interfaces/month';

@Component({
  selector: 'app-fc-entry-detail-dialog',
  templateUrl: './fc-entry-detail-dialog.html',
  styleUrls: ["./fc-entry-detail-dialog.component.scss"]
})
export class FcEntryDetailDialogComponent {
  userId: number;
  month: Month;
  cancelButtonText = "Done";
  lastName: string;
  firstName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FcEntryDetailDialogComponent>) {
    if (data) {
      this.userId = data.userId;
      this.month = data.month;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    }
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

}