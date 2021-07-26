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

  currentMonthId: number;

  previousMonthDisabled: boolean;
  nextMonthDisabled: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<FcEntryDetailDialogComponent>) {
      this.nextMonthDisabled = true;
      this.previousMonthDisabled = true;
      if (data) {
        this.userId = data.userId;
        this.month = data.month;
        this.currentMonthId = data.month.id;
        this.months = data.months;
        this.monthName = data.month.name;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
      }

      this.isNextPrevDisabled();
  }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  previousMonth() :void{
    if(this.currentMonthId - 1 >= this.months[0].id){
      this.currentMonthId -= 1;
      this.month = this.months.find(m => m.id == this.currentMonthId);
      this.monthName = this.month.name;
    }
    this.isNextPrevDisabled();
  }

  nextMonth() :void{
    if(this.currentMonthId + 1 <= this.months[this.months.length -1].id){
      this.currentMonthId += 1;
      this.month = this.months.find(m => m.id == this.currentMonthId);
      this.monthName = this.month.name;
    }
    this.isNextPrevDisabled();
  }

  isNextPrevDisabled() : void{
    if(this.currentMonthId + 1 <= this.months[this.months.length -1].id){
      this.nextMonthDisabled = false;
    }else{
      this.nextMonthDisabled = true;
    }
    if(this.currentMonthId - 1 >= this.months[0].id){
      this.previousMonthDisabled = false;
    }else{
      this.previousMonthDisabled = true;
    }
  }
}