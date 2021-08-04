import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-fc-entry-summary-vacation-warning',
  templateUrl: './fc-entry-summary-vacation-warning.html',
  styleUrls: ["./fc-entry-summary-vacation-warning.component.scss"]
})
export class FcEntrySummaryVacationWarningComponent {

  /**
   * default constructor for confirmMessageDialog
   * @param dialogRef
   * */
  constructor( 
    private dialogRef: MatDialogRef<FcEntrySummaryVacationWarningComponent>) {
    }  
}