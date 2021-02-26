import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Month } from "../../../core/interfaces/month";
import { UtilitiesService } from "../../../core/services/utilities.service";
import { PageStateService } from "../../../core/shared/page-state.service";
import { ExecutiveForecastsService } from "../../../core/services/forecasts/executive-forecasts.service";
import { DatePipe } from "@angular/common";
import { NgxPowerBiService } from "ngx-powerbi";
import { Subscription } from "rxjs";
import { AuthService } from "../../../core/security/auth.service";
import { environment } from "../../../../environments/environment";
import { ExecutiveChartComponent } from "../../components/executive-chart/executive-chart.component";
import { environment as env } from "../../../../environments/environment";
import { UserService } from "../../../core/services/user.service";
import { CalculationService } from "../../../core/services/forecasts/calculation.service";

/**
 * Executive forecast-view component
 */
@Component({
  selector: "app-executive",
  templateUrl: "./executive.component.html",
  styleUrls: ["./executive.component.scss"],
})
export class ExecutiveComponent implements OnInit, OnDestroy {

  /**
   * Implementation for powerbi service component
   */
  powerBiService: NgxPowerBiService;

  /**
   * Defines executive data view period (monthIDs)
   */
  period: any = { from: undefined, to: undefined };

  /**
   * Available months array
   */
  availableMonths: Month[] = [];

  //@Input('hop')
  //hop = false;

  /**
   * Selected months array
   */
  months: Month[] = [];
  monthSubscription: Subscription;
  forecastrSubscription: Subscription;

  /**
   * executive forecast-view component constructor
   * @param datePipe
   * @param authService
   * @param utilitiesService
   * @param pageState
   * @param executiveService
   */
  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    private utilitiesService: UtilitiesService,
    private pageState: PageStateService,
    private executiveService: ExecutiveForecastsService,
    private userService: UserService,
    private calculationService: CalculationService,
    public dialog: MatDialog
  ) {
    this.powerBiService = new NgxPowerBiService();
  }

  /**
   * init method
   */
  ngOnInit(): void {
    this.forecastrSubscription = this.pageState.forecastrReady$.subscribe(
      (ready: boolean) => {
        if (ready && this.authService.hasRole(environment.roles.msl)) {
          this.initExecutiveView();
        }
      }
    );
  }

  /**
   * Unsubscribes services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.monthSubscription.unsubscribe();
    this.forecastrSubscription.unsubscribe();
  }

  /**
   * Called when powerbi report was successfully embedded
   * @param $e
   */
  powerBIReportEmbedded($e): void {
    console.log("report embedded");
  }

  /**
   * Init method called when general forecastr data have been loaded successfully
   */
  initExecutiveView(): void {
    this.monthSubscription = this.utilitiesService.months$.subscribe(
      (months: Month[]) => {
        this.availableMonths = months;
        this.setDefaultPeriod();
      }
    );
  }

  /**
   * Sets the default period to current month until 6 months in the future
   */
  setDefaultPeriod(): void {
    let months: Month[] = this.utilitiesService.getMonths();

    for (let i: number = 0; i < months.length; i++) {
      if (
        Date.parse(months[i].time) >
        new Date().setMonth(new Date().getMonth() + 1) // -1 no prevois month
      ) {
        this.period.from = i;
        this.period.to = i + 5;
        this.showPeriod();
        break;
      }
    }
  }

  /**
   * Reloads the values after period update
   */
  showPeriod(): void {
    if (this.period.to < this.period.from) {
      this.period.to = this.period.from;
    }

    this.pageState.showSpinner();
    this.executiveService.resetSummaryValues();
    this.months = this.utilitiesService
      .getMonths()
      .filter((m: Month) => m.id >= this.period.from && m.id <= this.period.to);
    this.executiveService.initializeSummaryValues(
      this.period.from,
      this.period.to
    );
    this.calculationService.init(this.period.from, this.period.to);
    this.executiveService.initalizeGraphicData(
      this.period.from,
      this.period.to
    );
  }

  /**
   * Called for executive view summary data download
   */
  downloadCSV(): void {
    this.pageState.showSpinner();

    this.executiveService
      .getCsvExportData(this.period.from, this.period.to)
      .subscribe(
        (data: any) => {
          this.pageState.hideSpinner();
          this.downloadFile(data);
        },
        () => this.pageState.hideSpinner()
      );
  }

  /**
   * Download csv file with team forecast data
   * @param data
   */
  downloadFile(data: any): void {
    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string =
      this.datePipe.transform(new Date(), "yyyyMMdd") +
      "-Forecastsummary-Period.csv";

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const url: string = window.URL.createObjectURL(blob);

      let a: HTMLAnchorElement = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  /**Open dialog for executive chart */
  openDialog(): void {
    const dialogRef = this.dialog.open(ExecutiveChartComponent, {
      height: "90%",
      width: "90%",
      panelClass: "custom-dialog-container",
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  isExecutive(): boolean {
    return this.authService.hasRole(env.roles.msl);
  }
  
  isMSLLevelRole(roleName: string): boolean {
    if (!this.isExecutive()) {
      return false;
    }

    let userId = this.authService.getUserId();

    if (userId === undefined) {
      return false;
    }

    let roleId = this.userService.getUser(userId).roleId;

    if (roleId === undefined) {
      return false;
    }

    let role = this.userService.getRole(roleId).shortcut;

    if (role === undefined) {
      return false;
    }

    return role === roleName;
  }

}
