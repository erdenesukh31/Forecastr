import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-fc-entry-summary-remdays-warning',
  templateUrl: './fc-entry-summary-remdays-warning.html',
  styleUrls: ["./fc-entry-summary-remdays-warning.component.scss"]
})
export class FcEntrySummaryRemDaysWarningComponent {

  /**
   * default constructor for confirmMessageDialog
   * @param dialogRef
   * */
  constructor( 
    private dialogRef: MatDialogRef<FcEntrySummaryRemDaysWarningComponent>) {
    }  
}