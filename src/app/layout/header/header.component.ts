import { Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "../../core/security/auth.service";
import { LoginService } from "../../core/security/login.service";
import { UserService } from "../../core/services/user.service";
import { User } from "../../core/interfaces/user";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material";
import { GetStarted } from "../getStartedModal/get-started.component";
import { FaqModalComponent } from "../faq-modal/faq-modal.component";
import { environment as env } from "../../../environments/environment";
import { Role } from "../../core/interfaces/role";
import { DeviceDetectorService } from "ngx-device-detector";
import { OrganizationDialogComponent } from "../organizationModal/organization-dialog.component";

/**
 * header component
 */
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * Logged in user
   */
  user: User;
  userSubscription: Subscription;

  /**
   * Possible roles
   */
  roles: Role[];
  roleSubscription: Subscription;

  supportedBrowser: boolean = false;

  /**
   * header component constructor
   */
  constructor(
    public dialog: MatDialog,
    public dialog2: MatDialog,
    public dialog3: MatDialog,
    public router: Router,
    private auth: AuthService,
    private loginService: LoginService,
    private userService: UserService,
    private deviceService: DeviceDetectorService
  ) {}

  /**
   * Inits user variable at header init
   */
  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe((user: User) => {
      this.user = user;
    });

    this.roleSubscription = this.userService.roles$.subscribe(
      (roles: Role[]) => {
        this.roles = roles;
      }
    );

    if (this.auth.showGetStarted()) {
      this.openStepper();
    }

    if (
      this.deviceService.browser === "Chrome" ||
      this.deviceService.browser === "Edge" ||
      this.deviceService.browser == "Firefox"
    ) {
      this.supportedBrowser = true;
    }
  }

  showHome(): void {
    let params: string[] = this.router.url.substr(1).split("/");
    console.log(params);
    if (params.length >= 1 && params[0] === "forecast") {
      return;
    } else {
      this.router.navigate(["/forecast"]);
    }
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  /**
   * returns user role description
   */
  getRole(): string | boolean {
    if (this.roles.find((r: Role) => r.roleId === this.user.roleId)) {
      return this.roles.find((r: Role) => r.roleId === this.user.roleId).name;
    }

    return false;
  }

  /**
   * Returns whether the logged in user has admin permissions
   */
  isAdmin(): boolean {
    if (this.auth.hasRole(env.roles.admin)) {
      return true;
    }

    return false;
  }

  /**
   * Returns if user is logged in.
   * Otherwise: false
   */
  isLogged(): boolean {
    return this.auth.isLogged() || false;
  }

  /**
   * Calls logout
   */
  logout(): void {
    this.loginService.logout();
  }

  /**
   * open Modal with showcase
   */
  openStepper(): void {
    let dialogRef: any = this.dialog.open(GetStarted, {
      height: "auto",
      width: "60vw",
      panelClass: "getSartedStepper-no-padding-dialog",
      //backdropClass: 'mat-dialog-container',
      data: {},
    });
  }

  /**
   * open Modal with showcase
   */
  openFAQ(): void {
    this.dialog2.open(FaqModalComponent, {
      height: "auto",
      width: "60vw",
      panelClass: "getSartedStepper-no-padding-dialog",
      //backdropClass: 'mat-dialog-container',
      data: {},
    });
  }

  /**
   * open Modal with enterprise structure
   */
  openOrganization(): void {
    this.dialog3.open(OrganizationDialogComponent, {
      height: "auto",
      width: "80vw",
      panelClass: "getSartedStepper-no-padding-dialog",
      data: {},
    });
  }

  /**
   * send EMail to admin
   */
  sendMail(): void {
    var mail = "mailto:forecastrteam.at@capgemini.com";
    window.open(mail);
  }
}
