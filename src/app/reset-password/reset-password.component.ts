import { Component, OnInit } from '@angular/core';
import { ResetPasswordService } from '../core/security/resetPassword.service';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmMessageDialog } from '../forecast/dialogs/confirm-message/confirm-message.dialog';

function passwordMatcherValidator(control: AbstractControl): { [key: string]: any } | null {
  let newPasswordControl = control.get('newPassword');
  let confirmPasswordControl = control.get('confirmPassword');

  if(newPasswordControl.pristine || confirmPasswordControl.pristine) {
    return null;
  }

  if(newPasswordControl.value === confirmPasswordControl.value) {
    return null;
  }
  return {'passwordMatch': true};
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit{
  /**
   * Contains error message if an error happened at the login
   */
  formSubmitError: string;

  /**
   * true while login process is active
   */
  resetActive: boolean = false;

  /**
   * Reset form group element for comparing two password fields
   */
  resetPasswordGroup: FormGroup;

  /**
   * Token, which is returned from database and is created for resetting password
   */
  resetPasswordToken: string;

  /**
   * Response text for successful and unsuccessful attempts for resetting password
   */
  readonly responseSuccessfulText: string = "Your password has been successfully changed. You will be re-directed to login page shortly.";
  readonly responseUnsuccessfulText: string = "Problem occured while resetting your password. Please check your reset link and try again later.";
  readonly responseRejectedText: string = "Your password is not strong enough. Please read the rules above again to generate your password.";

  constructor(
    private resetPasswordService: ResetPasswordService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,) { }

  ngOnInit() {
    this.resetPasswordGroup = this.fb.group({
      newPassword: [''],
      confirmPassword: [''],
    }, {validator: passwordMatcherValidator});
  }

  resetPassword(): void {
    //this.resetActive = false;

    let resetToken = this.activatedRoute.snapshot.paramMap.get('token');
    let newPassword = this.resetPasswordGroup.controls['newPassword'].value;

    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
      data: {
        message: "Are you sure you want to reset your password? This action cannot be undone.",
        button: { cancel: 'Cancel', submit: 'Reset' },
      },
    });

    dialogRef.afterClosed().subscribe((remove: boolean) => {
      this.resetActive = true;
      if (remove === true) {
        this.resetPasswordService.resetPasswordWithToken(resetToken, newPassword).subscribe(
          (response: any) => {
            this.resetActive = false;
            if(response.status === 200) {
              this.snackBar.open(this.responseSuccessfulText, "",{duration: 5000,});
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 5000);
            }
            else {
              this.snackBar.open(this.responseUnsuccessfulText, "",{duration: 5000,});
            }
          },
          (error: any) => {
            this.resetActive = false;
            if(error.status === 422) {
              this.snackBar.open(this.responseRejectedText, "",{duration: 5000,});
            }
            else {
              this.snackBar.open(this.responseUnsuccessfulText, "",{duration: 5000,});
            }
            
          }
        );
      }
    });
    
  }

}
