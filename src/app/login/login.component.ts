import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../core/security/auth.service';
import { LoginService } from '../core/security/login.service';
import { ifError } from 'assert';
import { environment as env, environment } from '../../environments/environment';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmMessageDialog } from '../forecast/dialogs/confirm-message/confirm-message.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetPasswordService } from '../core/security/resetPassword.service';
import { GetStarted } from "../layout//getStartedModal/get-started.component";
import { MissingDataService } from '../core/services/missing-data-service';
import { MissingUserData } from "../core/interfaces/missingPersonData";

/**
 * Handles login page + initiates login process
 */
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  /**
   * Contains error message if an error happened at the login
   */
  formSubmitError: string;

  /**
   * Contains error message if an error happened at the reset password
   */
  emailInvalidError: string;
  isEmailFieldEmpty: boolean;

  /**
   * true while login process is active
   */
  loginActive: boolean = false;

  /**
   * Login form in order to differentiate among form elements for input validation
   */
  loginFormGroup: FormGroup;
  loginEmail: AbstractControl;
  loginPassword: AbstractControl;

  isMissingUserData: MissingUserData;

  /**
   * login component constructor
   * Routes to home page if user is already logged-in
   */
  constructor(
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private resetPasswordService: ResetPasswordService,
    private missingDataService: MissingDataService
  ) {
    if (this.authService.isLogged()) {
      this.routeToHomePage();
    }
  }

  ngOnInit(): void {
    this.initializeLoginForm();
  }


  /**
   * Calls the login method
   * If login successful: redirects to home-page
   * Otherwise: Shows error
   * @param login
   */
  login(): void {
    this.formSubmitError = undefined;
    this.loginActive = true;
    this.isEmailFieldEmpty = false;

    this.loginService
      .login(this.loginEmail.value, this.loginPassword.value)
      .subscribe(
        (res: any) => {
          const response: any = this.authService.useToken(res.headers.get('Authorization'));

          if (response) {
            let firstTime = true;
            this.missingDataService.initMissingData();

            this.missingDataService.missingUserData$.subscribe((data: MissingUserData) => {

              if (data != null  && data != undefined) {
                if (data.isMissingEngagementManager != undefined &&(data.isMissingEngagementManager || data.isMissingProdUnitCode ||
                  data.isMissingStartDate || data.workingHours == 0)) {
                  if (firstTime) {
                    this.openStepper();
                    firstTime = false;
                  }
                }
                else if(data.isMissingEngagementManager != undefined && !data.isMissingEngagementManager && !data.isMissingProdUnitCode &&
                  !data.isMissingStartDate && data.workingHours != 0) {
                    if (firstTime) {
                      if (typeof res.body.showGetStarted !== 'undefined') {
                         this.authService.setGetStarted(res.body.showGetStarted);
                      }
                      this.routeToHomePage();
                      firstTime = false;
                    }
                }
              }
            })
          } else {
            this.formSubmitError = 'Invalid user token.';
          }
          this.loginActive = false;
        },
        (e: any) => {
          console.log("Error message is: " + e.status);
          this.authService.setLogged(false);
          if (e.status == "401") {
            this.formSubmitError = e.error;
          } else if (e.status == "404") {
            this.formSubmitError = e.error;
          } else if (e.status == "409") {
            this.formSubmitError = e.error;
          } else {
            this.formSubmitError = 'Problem occured with login process. Please try again later.';
          }
          this.loginActive = false;
        },
      );
  }

  /**
    * open Modal with showcase
    */
  openStepper(): void {
    let dialogRef: any = this.dialog.open(GetStarted, {
      height: "auto",
      width: "60vw",
      panelClass: "getSartedStepper-no-padding-dialog",
      data: {},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.routeToHomePage();
    });
  }

  resetPassword(): void {
    this.isEmailFieldEmpty = this.loginEmail.invalid;
    this.formSubmitError = undefined;

    if (this.isEmailFieldEmpty) {
      this.emailInvalidError = "Please enter your e-mail address.";
    }
    else {
      this.isEmailFieldEmpty = false;
      let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
        data: {
          message: "Are you sure you want to reset your password for the following e-mail address: " + this.loginEmail.value + "?",
          button: { cancel: 'Cancel', submit: 'Reset' },
        },
      });

      dialogRef.afterClosed().subscribe((remove: boolean) => {
        this.loginActive = true;
        if (remove === true) {
          this.resetPasswordService.resetPassword(this.loginEmail.value).subscribe(
            (response: any) => {
              this.loginActive = false;
              this.snackBar.open("A reset link has been sent to " + this.loginEmail.value + ". Please check your e-mail inbox.", "", { duration: 5000, });
            },
            (error: any) => {
              this.loginActive = false;
              this.snackBar.open("Problem occured while resetting your password. Please check if you typed your e-mail address correctly.", "", { duration: 5000, });
            }
          );
        }
        else {
          this.loginActive = false;
        }
      });
    }
  }

  /**
   * Initialization of login form for ngOnInit
   */
  private initializeLoginForm() {
    this.loginFormGroup = this.fb.group({
      loginEmail: ['', Validators.required],
      loginPassword: ['', Validators.required],
    });

    this.loginEmail = this.loginFormGroup.controls['loginEmail'];
    this.loginPassword = this.loginFormGroup.controls['loginPassword'];
  }

  /**
   * Routes to home page (depending on user role)
   */
  private routeToHomePage(): void {
    if (this.authService.hasRole(env.roles.css)) {
      this.router.navigate(['/forecast']);
    } else if (this.authService.hasRole(env.roles.admin)) {
      this.router.navigate(['/' + env.routes.admin]);
    }
  }
}
