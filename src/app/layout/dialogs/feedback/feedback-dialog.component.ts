import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../../../core/shared/business-operations.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectRequest } from "../../../core/interfaces/projectRequest";
/**
 * Component for Feedback Dialog
 */
@Component({
  selector: 'app-feedback-dialog',
  templateUrl: "./feedback-dialog.component.html"
})
export class FeedBackDialogComponent {
  
  projectCode:String = "";

  projectName:String = "";

  projectComment:String = "";
  
  /**
   * default constructor for addProjectDialog
   * @param dialogRef
   * @param data
   */
  constructor(
    public dialogRef: MatDialogRef<FeedBackDialogComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.projectCode = data.code;
    this.projectName = data.name;
    this.projectComment = data.comment;

  }

  public openEmail() {
  }

  ngOnInit(): void {

  }
}