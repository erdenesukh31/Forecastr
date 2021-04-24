import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


@Component({
  selector: 'app-executive-fc-entry',
  templateUrl: './executive-fc-entry.component.html',
  styleUrls: ['./executive-fc-entry.component.scss']
})
export class ExecutiveFcEntryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ExecutiveFcEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
}
