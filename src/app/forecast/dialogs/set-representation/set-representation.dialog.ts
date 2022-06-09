import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpClient } from '@angular/common/http';
import { BusinessOperationsService } from '../../../core/shared/business-operations.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from "../../../core/interfaces/user";
import { TeamUserService } from "../../../core/services/forecasts/team-user.service";
import { UserService } from "../../../core/services/user.service";
import { Subscription } from "rxjs";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
/**
 * Component for Add Project Dialog
 */
@Component({
  templateUrl: "./set-representation.dialog.html",
  styleUrls:  ['./set-representation.dialog.scss'],
})
export class SetRepresentationDialog implements OnInit, OnDestroy {

  /**
    *representation form group
    */
  representationForm: FormGroup;
  /**
  * list of user (for teamlead select)
  */
  pdls: User[];

  pdlsSubscription: Subscription;

  representative: User = new User();

  isRepresentative: boolean;

  currentUser: User;

  /**
   * role list subscription
   */
  roleSubscription: Subscription;
  /**
   * default constructor for addProjectDialog
   * @param dialogRef
   * @param data
   * @param fb
   */
  constructor(
    public dialogRef: MatDialogRef<SetRepresentationDialog>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private BO: BusinessOperationsService,
    private teamUserService: TeamUserService,
    private fb: FormBuilder,
    private userService:UserService,
    // @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.representationForm = this.fb.group({
      representativeId: fb.control(this.representative.id),
      isRepresentative: fb.control(this.isRepresentative),
    })
  }

  /**
     * Initializes user + role subscriptions
     */
  ngOnInit(): void {

    this.userService.user$.subscribe((user =>{
      this.currentUser = user;
    }))

    this.pdlsSubscription = this.teamUserService.pdls$
    .subscribe((user: User[]) => {
      this.pdls = user;
    });

    if(this.currentUser.isRepresentedBy !== null){
      this.representative = this.pdls.find(user  => user.id === this.currentUser.isRepresentedBy);
      this.isRepresentative = true;
      this.representationForm.controls['representativeId'].setValue(this.representative.id);
      this.representationForm.controls['isRepresentative'].setValue(this.isRepresentative);
      } else{
        this.representative = new User();
        this.isRepresentative = false;
      }
  }

  getTeamleads(): User[] {

    let pdls = this.pdls.filter((pdl:User)=>{ return pdl.id !== this.currentUser.id;})
    return pdls;
  }

  ngOnDestroy(): void {
    this.pdlsSubscription.unsubscribe();
  }
  /**
   * Called on 'Cancel' click
   */
  onCancelClick(): void {
    this.dialogRef.close(false);
  }
  representativeUpdate(): void{

    this.representative = this.pdls.find(user  => user.id === this.representationForm.controls['representativeId'].value);
  }
  /**
   * Called on 'Save' Click
   */
  onSaveClick(): void {
   if(this.isRepresentative === true){
      this.teamUserService.setRepresentative(this.currentUser.id, this.representative.id);
    }
    else{
      this.teamUserService.removeRepresentative(this.currentUser.id);
    }
  this.dialogRef.close();
  }
}