import {
  Component,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../core/security/auth.service";
import { UtilitiesService } from "../core/services/utilities.service";
import { PageStateService } from "../core/shared/page-state.service";
import { UserService } from "../core/services/user.service";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { environment as env } from "../../environments/environment";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ExecutiveForecastsService,
  SummaryValues,
} from "../core/services/forecasts/executive-forecasts.service";
import { ExecutiveChartComponent } from "./components/executive-chart/executive-chart.component";
import { ExecutiveChartPdlComponent } from "./components/executive-chart-pdl/executive-chart-pdl.component";
import { ExecutiveChartPlComponent } from "./components/executive-chart-pl/executive-chart-pl.component";
import { SetRepresentationDialog } from "./dialogs/set-representation/set-representation.dialog";
import { SubcoExecutiveChartComponent } from "./components/subco-executive-chart/subco-executive-chart.component";
import { Month } from "../core/interfaces/month";
import { TeamService } from "../core/services/admin/team.service";
import { TeamUserService } from "../core/services/forecasts/team-user.service";
import { Team } from "../core/interfaces/team";
import { PowerBi } from "./components/power-bi/power-bi.component";

/**
 * forecast component
 */
@Component({
  selector: "public-forecast",
  templateUrl: "./forecast.component.html",
  styleUrls: ["./forecast.component.scss"],
})
export class ForecastComponent implements OnInit, OnDestroy {
  summary: SummaryValues[];

  /**
   * contains string of currently active page
   */
  page: string = "individual";

  /**
   * List of all open requests
   */
  openRequests: string[] = [];

  /**
   * Error list
   */
  error: string[] = [];

  /**
   * spinner state variable
   */
  spinnerActive: boolean;

  /**
   * Spinner subscription
   */
  spinnerSubscription: Subscription;

  /**
   * Selected months array
   */
  dashboardMonths: Month[] = [];

  /**
   * forecast-component constructor
   * @param router
   * @param snackBar
   * @param authService
   * @param userService
   * @param utilitiesService
   * @param pageState
   */
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private utilitiesService: UtilitiesService,
    private pageState: PageStateService,
    private executiveService: ExecutiveForecastsService,
    private teamService: TeamUserService,
  ) {
    this.spinnerActive = true;
  }

  /**
   * Redirects to specific page if it is defined in url
   * Initializes utility data
   */
  ngOnInit(): void {
    this.openRequests = [
      "months",
      "projects",
      "probabilities",
      "user",
      "grades",
      "roles",
      "users",
      "kpi",
      "teams",
    ];

    this.utilitiesService
      .initMonths()
      .then(() => {
        this.checkRequests("months");
      })
      .catch(() => {
        this.error.push("Error loading months.");
        this.checkRequests("months");
      });

    this.utilitiesService
      .initProjects()
      .then(() => {
        this.checkRequests("projects");
      })
      .catch(() => {
        this.error.push("Error loading projects.");
        this.checkRequests("projects");
      });

    this.utilitiesService
      .initProbabilities()
      .then(() => {
        this.checkRequests("probabilities");
      })
      .catch(() => {
        this.error.push("Error loading probabilities.");
        this.checkRequests("probabilities");
      });

    this.userService
      .initializeGrades()
      .then(() => {
        this.checkRequests("grades");
      })
      .catch(() => {
        this.error.push("Error loading grades.");
        this.checkRequests("grades");
      });

    this.userService
      .initUser()
      .then(() => {
        this.checkRequests("user")
      }).catch(() => {
        this.error.push("Error loading user.");
        this.checkRequests("user");
      });

    this.userService
      .initializeRoles()
      .then(() => {
        this.checkRequests("roles");
      }).catch(() => {
        this.error.push("Error loading roles.");
      });

    if (this.authService.hasRole(env.roles.msl)) {
      this.userService.initializeAllUser().then(() => {
        this.checkRequests("users");
        
        this.teamService.initializeTeams().then(() => {
          this.checkRequests("teams");
        }).catch(() => {
          this.error.push("Error loading all Teams.");
          this.checkRequests("teams");
        })
      }).catch(() => {
        this.error.push("Error loading all Users.");
        this.checkRequests("users");
        this.checkRequests("teams");
      })
    } else {
      this.checkRequests("users");
      this.checkRequests("teams");
    }

    if (this.authService.getRoleId() == env.roles.pdl){
      this.executiveService.initializeKpiValuesPDL(this.authService.getUserId()).then(() => {
        this.checkRequests("kpi");
      })
      this.teamService.initializePDLs();
    }
    if (this.authService.getRoleId() == env.roles.pl){
      this.executiveService.initializeKpiValuesPL(this.authService.getUserId()).then(() => {
        this.checkRequests("kpi");
      })
    }
    if (this.authService.hasRole(env.roles.msl)) {
      this.executiveService.initializeKpiValues().then(() => {
        this.checkRequests("kpi");
      })
    } else {
      this.checkRequests("kpi");
    }

    this.spinnerSubscription = this.pageState.spinner$.subscribe(
      (spinner: boolean) => {
        this.spinnerActive = spinner;
      }
    );
  }

  /**
   * Unsubscribes services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.spinnerSubscription.unsubscribe();
  }

  mslHasPractice(): boolean {
    if(!this.isExecutive()) {
      return false;
    }
    
    if(this.teamService.getPrTeams() !== undefined || this.teamService.getPrTeams().length !== 0) {
      let ts = this.teamService.getPrTeams().filter((t: Team) => t.teamLeadId === this.authService.getUserId());
      return ts.length > 0;
    } else {
      return false;
    }
  }

  getPage(): string {
    let page = "";

    if (this.isFinancialController()) {
      page = "financial-controller";
    } else if (this.isExecutive()) {
      let roleId = this.userService.getUser(this.authService.getUserId()).roleId;
      page = this.getMSLPage(roleId);
    } else {
      let params: string[] = this.router.url.substr(1).split("/");
      page = this.getPageFromParams(params);
    }

    return page
  }

  getMSLPage(roleId: number): string {
    if (roleId !== undefined) {
      let roleName = this.userService.getRole(roleId).shortcut;

      if (this.hasMSLLevelRole("HOP", roleName)) {
        return "head-of-practices";
      }

      if (this.hasMSLLevelRole("SM", roleName)) {
        return "staffing";
      }

      if(this.hasMSLLevelRole("SMCSS", roleName)) {
        return "staffing";
      }
    }

    return "executive";
  }

  getPageFromParams(params: string[]): string {
    if (params.length >= 2) {
      if (params[1] === "team") {
        return "team";
      } else if (params[1] === "practice") {
        return "practice";
      } else if (params[1] === "staffing") {
        return "staffing";
      } else if (params[1] === "head-of-practices") {
        return "head-of-practices";
      } else if (params[1] === "executive") {
        return "executive";
      } else if (params[1] === "practices") {
        return "practices";
      } else if (params[1] === "financial-controller") {
        return "financial-controller";
      } else if (params[1] === "subcos") {
        return "subcos";
      } else if (params[1] === "subcos-exectuive") {
        return "subcos-exectuive";
      }
      else {
        return "individual";
      }
    } else {
      return "individual";
    }
  }

  /**
   * Opens other page
   * @param page
   */
  goToPage(page: string): void {
      this.page = page;
      this.router.navigate(["/forecast/" + page + "/active"]);
  }

  isMSLLevelRole(roleName: string): boolean {
    if (!this.isExecutive()) {
      return false;
    }

    let userId = this.authService.getUserId();

    if (userId === undefined) {
      return false;
    }
   
    let roleId = this.userService.getUser(userId) !== undefined ? this.userService.getUser(userId).roleId : undefined;

    if (roleId === undefined) {
      return false;
    }

  
    let role =   this.userService.getRole(roleId) !== undefined ? this.userService.getRole(roleId).shortcut : undefined;

    if (role === undefined) {
      return false;
    }

    return role === roleName;
  }

  hasMSLLevelRole(roleNameExpected: string, roleNameActual: string): boolean {
    return this.isExecutive() && roleNameActual !== undefined && roleNameActual === roleNameExpected;
  }

  hasLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pdl);
  }

  isEm(): boolean {
    return this.authService.isEngagementManager();
  }

  isEmAndHasNoLeadRole(): boolean {
    return this.authService.isEngagementManager() && !this.authService.hasRole(env.roles.pdl);
  }

  isPractice(): boolean {
    return this.authService.hasRole(env.roles.pl);
  }

  isExecutive(): boolean {
    return this.authService.hasRole(env.roles.msl);
  }

  isFinancialController(): boolean {
    return this.authService.hasRole(env.roles.fc);
  }

  openRepresentationDialog(): void {
    let dialogRef = this.dialog.open(SetRepresentationDialog, {
      height: 'auto',
      width: '50vw',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  /**Open dialog for executive chart */
  openDashboard(): void {

    if (this.authService.getRoleId() == env.roles.pdl){
 
      const dialogRef = this.dialog.open(ExecutiveChartPdlComponent, {
        height: "90%",
        width: "90%",
        panelClass: "custom-dialog-container",
        data: {},
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log("The dialog was closed");
      });
     
    }
    if (this.authService.getRoleId() == env.roles.pl){

      const dialogRef = this.dialog.open(ExecutiveChartPlComponent, {
        height: "90%",
        width: "90%",
        panelClass: "custom-dialog-container",
        data: {},
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log("The dialog was closed");
      });
    }
    if (this.authService.hasRole(env.roles.msl)) {
      const dialogRef = this.dialog.open(ExecutiveChartComponent, {
        width: "90%",
        panelClass: "custom-dialog-container",
        data: {},
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log("The dialog was closed");
      });
    }
  }

    /**Open dialog for executive chart */
    openPowerBiDashboard(): void {
      if (this.authService.hasRole(env.roles.pdl)) {
        const dialogRef = this.dialog.open(PowerBi, {
          width: "960px",
          height: "568px",
          panelClass: "custom-dialog-container",
          data: {},
        });
  
        dialogRef.afterClosed().subscribe((result) => {
          console.log("The dialog was closed");
        });
      }
    }



  /**Open dialog for subco executive chart */
  openDashboardSubco(): void {
    if (this.authService.hasRole(env.roles.pdl)) {
      const dialogRef = this.dialog.open(SubcoExecutiveChartComponent, {
        height: "90%",
        width: "90%",
        panelClass: "custom-dialog-container",
        data: {},
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log("The dialog was closed");
      });
    }
  }
  /**
   * Check if init-request are open
   * If not: sets forecastr ready + hides spinner
   * @param req
   */
  private checkRequests(req: string): void {
    this.openRequests = this.openRequests.filter((r: string) => r !== req);

    if (this.openRequests.length === 0) {

      if (this.error.length) {
        this.error.forEach((e: string) => {
          this.snackBar.open(e, "OK", { duration: 30000 });
        });
      } else {
        this.pageState.setForecastrReady();

        if (this.page !== "executive" && this.page !== "head-of-practices" && this.page !== "staffing" && this.page !== "financial-controller") {
          this.pageState.hideSpinner();
        }
      }

      this.goToPage(this.getPage());
    }
  }
}
