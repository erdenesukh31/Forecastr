import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ProjectRequest } from "../../../core/interfaces/projectRequest";
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../../../core/shared/business-operations.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Component for Add Project Dialog
 */
@Component({
  templateUrl: "./project-request.dialog.html"
})
export class ProjectRequestDialog {
  
  projectCode:String = "";

  projectName:String = "";

  projectComment:String = "";
  
  /**
   * default constructor for addProjectDialog
   * @param dialogRef
   * @param data
   */
  constructor(
    public dialogRef: MatDialogRef<ProjectRequestDialog>,
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
    let projectRequest = new ProjectRequest();
    projectRequest.comment = this.data.comment;
    projectRequest.projectCode = this.data.code;
    projectRequest.projectName = this.data.name;

    this.http.post(this.BO.requestProject(), projectRequest).subscribe((res: any) => {
      this.snackBar.open("A Request has been sent to add this Project", "", {duration: 1000,});
    },
    (e: any) => {
      this.snackBar.open("A Problem has occured while performing the Project Request", "", {duration: 1000,});
    });
  }
}