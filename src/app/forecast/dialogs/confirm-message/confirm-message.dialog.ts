import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

/**
 * Component for Confirm Message Dialog
 */
@Component({
  templateUrl: "./confirm-message.dialog.html"
})
export class ConfirmMessageDialog {
  /**
   * default constructor for confirmMessageDialog
   * @param dialogRef
   * @param data
   */
  constructor(
    public dialogRef: MatDialogRef<ConfirmMessageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}
}
