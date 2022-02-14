import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { cloneDeep } from 'lodash';

import { UtilitiesService } from "../../../core/services/utilities.service";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { UserService } from "../../../core/services/user.service";

import { FcEntry } from "../../../core/interfaces/fcEntry";
import { Project } from "../../../core/interfaces/project";
import { Month } from "../../../core/interfaces/month";
import { User } from "../../../core/interfaces/user";

import { Subscription } from "rxjs";
import { ExecutiveForecastsService } from "../../../core/services/forecasts/executive-forecasts.service";
import { FcProject } from "../../../core/interfaces/fcProject";
import { ConfirmMessageDialog } from "../../dialogs/confirm-message/confirm-message.dialog";
import { TeamForecastService } from "../../../core/services/forecasts/team-forecasts.service";
import { PageStateService } from "../../../core/shared/page-state.service";
import { AuthService } from "../../../core/security/auth.service";
import { environment as env } from "../../../../environments/environment";
import { DatePipe } from "@angular/common";
import { SubCoFcIntExt } from "../../../core/interfaces/subCoFcIntExt";
import { SubCoFcOffshore } from "../../../core/interfaces/subCoFcOffshore";
import { getMultipleValuesInSingleSelectionError } from "@angular/cdk/collections";
import { SubCoFinancialControllerService } from "../../../core/services/subCoFinancialController.service";
import { SubcoSummaryComponent } from "../subco-summary/subco-summary.component";
import { MatCalendarBody } from "@angular/material/datepicker";
import { ExecutiveChartComponent } from "../executive-chart/executive-chart.component";
import { SubcoExecutiveChartComponent } from "../subco-executive-chart/subco-executive-chart.component";
import { SubCoService } from "../../../core/services/subCo.service";
import { SubCoDetailTotals } from "../../../core/interfaces/subCoDetailTotals";
import { SubCoForecastService } from "../../../core/services/subCoForecast.service";
/**
 * teamlead summary component
 */
@Component({
  selector: "app-subco-executive-detail",
  templateUrl: "./subco-executive-detail.component.html",
  styleUrls: ["./subco-executive-detail.component.scss"]
})
export class SubcoExecutiveDetailComponent implements OnInit, OnDestroy {
  /**
   * month (received as input)
   */
  @Input('month') month: Month;
  @Input('months') months: Month[];
  @Input('role') role: string;

  /**
   * viewSwitch saves if the PL of PDL View is shown as Output
   */
  @Output() viewSwitch = new EventEmitter<string>();

  @Input('switchState') switchState: string;

  filter: string;

  /**
   * sum all FTE
   */
  fte: number;

  /**
   * list of all subco dtos for internal
   */
  internalExternal: SubCoFcIntExt[];

  /**
  * list of all subco dtos for offshore
  */
  offshoreTotals: SubCoFcOffshore[];

  /**
* list of all subco dtos for internal
*/
  internalMonthRange: SubCoFcIntExt[];
  /**
 * list of all subco dtos for internal
 */
  externalMonthRange: SubCoFcIntExt[];

  /**
  * list of all subco dtos for offshore
  */
  offshoreTotalsRange: SubCoFcOffshore[];

  /**
* list of all subco dtos for offshore
*/
  offshoreAverage: SubCoFcOffshore;

  userId: number;

  teamSubscription: Subscription;

  loadingActive: boolean = false;

  totals: any = {
    revenue: 0,
    cost: 0,
    contribution: 0,
    cp: 0
  };

  totalsOffshore: any = {
    revenue: 0,
    cost: 0,
    contribution: 0,
    cp: 0
  };

  totalsCSVMonth: any = {
    revenue: 0,
    cost: 0,
    contribution: 0,
    cp: 0,
    manDay: 0
  }

  /**
     * contains totals-data 
     */
  subCoTotals: SubCoDetailTotals[];

  totalsSubscription: Subscription;

  /**
   * constructor for teamlead-summary component
   * @param datePipe
   * @param dialog
   * @param utilitiesService
   * @param forecastService
   * @param teamForecastService
   * @param userService
   * @param pageState
   */
  constructor(
    private subcoFinancialControllerService: SubCoFinancialControllerService,
    private subcoService: SubCoService,
    private subcoForecastService: SubCoForecastService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private datePipe: DatePipe,
    private pageState: PageStateService,
  ) {
    this.filter = 'internal'; // 'internal', 'external' or 'offshore'
    this.userId = this.authService.getUserId();
    this.fte = 0;
    this.totals = {
      manday: 0,
      revenue: 0,
      cost: 0,
      contribution: 0,
      cp: 0
    };

    this.totalsOffshore = {
      manday: 0,
      revenue: 0,
      cost: 0,
      contribution: 0,
      cp: 0
    };

    this.totalsCSVMonth = {
      revenue: 0,
      cost: 0,
      contribution: 0,
      cp: 0,
      manday: 0
    };
  }

  /**
   * 
   */
  ngOnInit(): void {

    if (this.switchState) {
      this.filter = this.switchState;
    }

    this.subcoForecastService.initSubCoDetailsByMonth(this.month.id);

    this.subcoFinancialControllerService.initSubCoExternalForMonthRange(this.month.id, this.month.id + 5),
    this.subcoFinancialControllerService.initSubCoInternalForMonthRange(this.month.id, this.month.id + 5),
    this.subcoFinancialControllerService.initSubCoOffshoreForMonthRange(this.month.id, this.month.id + 5),

    this.subcoService.initializeSubcoDetailTotalsForMonthRange(this.month.id, this.month.id + 5);
    this.subcoFinancialControllerService.initSubCoOffshoreForMonth(this.month.id);
    this.getValues();
  }

  getValues() {
    switch (this.filter) {
      case 'external':
        this.subcoFinancialControllerService.initSubCoExternalForMonth(this.month.id);

        this.subcoFinancialControllerService.intExtSubCo$.subscribe((external: SubCoFcIntExt[]) => {
          this.internalExternal = external;
          this.getTotals();
        })
        break;
      case 'offshore':
        this.subcoFinancialControllerService.offshoreSubCo$.subscribe((offshore: SubCoFcOffshore[]) => {
          this.offshoreTotals = offshore;
          this.getTotalsOffshore();
        })
        break;
      default:
      case 'internal':
        this.subcoFinancialControllerService.initSubCoInternalForMonth(this.month.id);

        this.subcoFinancialControllerService.intExtSubCo$.subscribe((internalSubco: SubCoFcIntExt[]) => {
          this.internalExternal = internalSubco;
          this.getTotals();
        })
        break;
    }
  }

  filterUpdate(filter: string): void {
    this.filter = filter;
    // this.teamleads = this.executiveService.calculateTeamleadValues(this.filter, this.team);
    this.getValues();
  }

  isFinancialController(): boolean {
    return this.authService.getRoleId() === env.roles.fc;
  }

  IsExecutive(): boolean {
    return this.authService.hasRole(env.roles.msl);
  }




  /**
   * Return value for given type (used for arve + urve + revenue + workingdays)
   * @param type
   * @param userId
   */
  getTeamValue(type: string, userId: number): number {
    return 0;
  }

  /**
   * 
   * @param status 
   * changes the status of pl or pdl and sends it to parent
   */
  changeView(status: string): void {
    this.viewSwitch.emit(status);
  }

  submitAll(): void{

  }

  unlockAll(): void{

  }

  /**
   * 
   */
  ngOnDestroy(): void {
  }

  exportCSV(): void {
    this.pageState.showSpinner();

    let body = "";
    let monthHeader = " ; ; ; ; ;Month;"
    let workingDaysMonth = " ; ; ; ; ;Working Days;"
    let headerValueNames = "Resource Name;Engagement Manager;Project Name;Customer; ;"
    let header = "";
    let lineEnding = "\r\n";
    let summaryLine = "";
    let summaryHeader = " ; ; ; ; Summary;"
    let avgFTEInt = " ; ; ; ; ;"
    let avgFTEExt = " ; ; ; ; ;"
    let avgFTEOffshore = " ; ; ; ; ;"
    let currentPosition = this.month.id;
    let skip = "; ; ; ; ; ;";

    let secondSheetHeader = ";";
    let RevExternalSub = "Revenue External Subcontractor ;";
    let RevInternalSub = "Revenue Internal Subcontractor ;";
    let RevOffshoreSub = "Revenue Offshore Subcontractor ;";
    let DCExternalSub = "DC External Subcontractor ;";
    let DCEInternalSub = "DC Internal Subcontractor ;";
    let DCOffshoreSub = "DC Offshore Subcontractor ;";
    let bodySecondSheet = "";

    this.subscribeMonthRange();
    this.months.forEach((month: Month) => {

      monthHeader += month.name + " ; ; ; ; ; ;";
      workingDaysMonth += month.workingdays + " ; ; ; ; ; ;";
      headerValueNames += "ManDay;Revenue;Cost;Contribution;CP; ;";
      secondSheetHeader += month.name + ";";

      this.getTotalsForSpecificMonth(month.id);
      summaryLine += this.numberToString(this.totalsCSVMonth.manday) + ";"
        + this.numberToString(this.totalsCSVMonth.revenue) + ";"
        + this.numberToString(this.totalsCSVMonth.cost) + ";"
        + this.numberToString(this.totalsCSVMonth.contribution) + ";"
        + this.numberToString(this.totalsCSVMonth.cp) + "; ;";

      avgFTEInt += "AverageFTE Internal;" + this.subCoTotals.find(sub => sub.monthId == month.id).subcontractorTotals.averageFTEInternal + "; ; ; ; ; ";
      avgFTEExt += "AverageFTE External;" + this.subCoTotals.find(sub => sub.monthId == month.id).subcontractorTotals.averageFTEExternal + "; ; ; ; ; ";
      avgFTEOffshore += "AverageFTE Offshore;" + this.subCoTotals.find(sub => sub.monthId == month.id).subcontractorTotals.averageFTEOffshore + "; ; ; ; ; ";
    });

    this.subCoTotals.forEach(element => {
      RevExternalSub += this.numberToString(element.subcontractorTotals.totalRevenueExternal / 1000) + ";";
      RevInternalSub += this.numberToString(element.subcontractorTotals.totalRevenueInternal / 1000) + ";";
      RevOffshoreSub += this.numberToString(element.subcontractorTotals.totalCostOffshore / 1000) + ";";
      DCExternalSub += this.numberToString(-element.subcontractorTotals.totalCostExternal / 1000) + ";";
      DCEInternalSub += this.numberToString(element.subcontractorTotals.totalCostInternal / 1000) + ";";
      DCOffshoreSub += this.numberToString(-element.subcontractorTotals.totalCostOffshore / 1000) + ";";
    });
    bodySecondSheet = RevExternalSub + lineEnding + RevInternalSub + lineEnding + RevOffshoreSub + lineEnding
      + DCExternalSub + lineEnding + DCEInternalSub + lineEnding + DCOffshoreSub + lineEnding;

    header += monthHeader + lineEnding + workingDaysMonth + lineEnding + headerValueNames + lineEnding;

    body += "Internal Subcontractors" + lineEnding;
    this.internalMonthRange.forEach((subco: any) => {

      const result = this.internalMonthRange.filter((sub: any) => sub.subcontractorIntExt.resourceName == subco.subcontractorIntExt.resourceName
        && sub.subcontractorIntExt.projectName == subco.subcontractorIntExt.projectName)
      if (result.length > 0) {
        let line = "";
        line += subco.subcontractorIntExt.resourceName + ";"
          + subco.subcontractorIntExt.engagementManagerName + ";"
          + subco.subcontractorIntExt.projectName + ";"
          + subco.subcontractorIntExt.customer + "; ;";

        result.forEach((subco: any) => {
          if (subco.monthId < currentPosition) {
            body = body + line + lineEnding;
            currentPosition = currentPosition - 1;
            line = "";
            line += subco.subcontractorIntExt.resourceName + ";"
              + subco.subcontractorIntExt.engagementManagerName + ";"
              + subco.subcontractorIntExt.projectName + ";"
              + subco.subcontractorIntExt.customer + "; ;";
          }
          if (subco.monthId > currentPosition) {
            while (subco.monthId != currentPosition) {
              line += skip;
              currentPosition = currentPosition + 1;
            }
          }
          line += this.numberToString(subco.subcontractorIntExt.manDay) + ";"
            + this.numberToString(subco.subcontractorIntExt.revenue) + ";"
            + this.numberToString(subco.subcontractorIntExt.cost) + ";"
            + this.numberToString(subco.subcontractorIntExt.contribution) + ";"
            + this.numberToString(subco.subcontractorIntExt.cp * 100, 2) + ";" + ";"


          currentPosition = currentPosition + 1;
        });
        currentPosition = this.month.id;
        this.internalMonthRange = this.internalMonthRange.filter((sub: any) => !(sub.subcontractorIntExt.resourceName == subco.subcontractorIntExt.resourceName
          && sub.subcontractorIntExt.projectName == subco.subcontractorIntExt.projectName));

        body = body + line + lineEnding;
      };
    });

    body += lineEnding + "External Subcontractors" + lineEnding;

    this.externalMonthRange.forEach((subco: any) => {

      const result = this.externalMonthRange.filter((sub: any) => sub.subcontractorIntExt.resourceName == subco.subcontractorIntExt.resourceName
        && sub.subcontractorIntExt.projectName == subco.subcontractorIntExt.projectName)
      if (result.length > 0) {
        let line = "";
        line += subco.subcontractorIntExt.resourceName + ";"
          + subco.subcontractorIntExt.engagementManagerName + ";"
          + subco.subcontractorIntExt.projectName + ";"
          + subco.subcontractorIntExt.customer + "; ;";

        result.forEach((subcoR: any) => {
          if (subco.monthId < currentPosition) {
            body = body + line + lineEnding;
            currentPosition = currentPosition - 1;
            line = "";
            line += subco.subcontractorIntExt.resourceName + ";"
              + subco.subcontractorIntExt.engagementManagerName + ";"
              + subco.subcontractorIntExt.projectName + ";"
              + subco.subcontractorIntExt.customer + "; ;";
          }
          if (subcoR.monthId > currentPosition) {
            while (subcoR.monthId != currentPosition) {
              line += skip;
              currentPosition = currentPosition + 1;
            }
          }

          line += this.numberToString(subco.subcontractorIntExt.manDay) + ";"
            + this.numberToString(subcoR.subcontractorIntExt.revenue) + ";"
            + this.numberToString(subcoR.subcontractorIntExt.cost) + ";"
            + this.numberToString(subcoR.subcontractorIntExt.contribution) + ";"
            + this.numberToString(subcoR.subcontractorIntExt.cp * 100, 2) + ";" + ";"

          currentPosition = currentPosition + 1;
        });

        currentPosition = this.month.id;

        this.externalMonthRange = this.externalMonthRange.filter((sub: any) => !(sub.subcontractorIntExt.resourceName == subco.subcontractorIntExt.resourceName
          && sub.subcontractorIntExt.projectName == subco.subcontractorIntExt.projectName))

        body = body + line + lineEnding;
      }
    });

    body += lineEnding + "Offshore" + lineEnding

    this.offshoreTotalsRange.forEach((subco: any) => {
      const result = this.offshoreTotalsRange.filter((sub: any) => sub.subcontractorOffshore.projectName == subco.subcontractorOffshore.projectName)
      if (result.length > 0) {
        let line = "";
        line += "" + ";"
          + subco.subcontractorOffshore.engagementManagerName + ";"
          + subco.subcontractorOffshore.projectName + ";"
          + subco.subcontractorOffshore.customer + "; ;";

        result.forEach((subcoR: any) => {
          if (subcoR.monthId > currentPosition) {
            while (subcoR.monthId != currentPosition) {
              line += skip;
              currentPosition = currentPosition + 1;
            }
          }
          line += this.numberToString(subco.subcontractorOffshore.totalManDays) + ";"
            + this.numberToString(subcoR.subcontractorOffshore.totalRevenue) + ";"
            + this.numberToString(subcoR.subcontractorOffshore.totalCost) + ";"
            + this.numberToString(subcoR.subcontractorOffshore.totalContribution) + ";"
            + this.numberToString(subcoR.subcontractorOffshore.totalCp * 100, 2) + ";" + ";"

          currentPosition = currentPosition + 1;
        });

        this.offshoreTotalsRange = this.offshoreTotalsRange.filter((sub: any) => sub.subcontractorOffshore.projectName != subco.subcontractorOffshore.projectName)

        body = body + line + lineEnding;
      }
    });

    const data = header + body + lineEnding + lineEnding + summaryHeader + summaryLine
      + lineEnding + lineEnding + avgFTEExt + lineEnding + avgFTEInt + lineEnding + avgFTEOffshore
      + lineEnding + lineEnding + secondSheetHeader + lineEnding + bodySecondSheet;
    const blob: Blob = new Blob(["\ufeff", data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SubcoOverview.csv";

    this.pageState.hideSpinner();

    let navigator: any = window.navigator;
    //For IE
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, filename);
      //For any other browser
    } else {
      const url: string = window.URL.createObjectURL(blob);

      let a: HTMLAnchorElement = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };
  }

  subscribeMonthRange(): void {
    this.subcoFinancialControllerService.intSubCoRange$.subscribe((internal: SubCoFcIntExt[]) => {
      this.internalMonthRange = internal;
    })

    this.subcoFinancialControllerService.extSubCoRange$.subscribe((external: SubCoFcIntExt[]) => {
      this.externalMonthRange = external;
    })

    this.subcoFinancialControllerService.offshoreSubCoRange$.subscribe((offshore: SubCoFcOffshore[]) => {
      this.offshoreTotalsRange = offshore;
    })

    this.totalsSubscription = this.subcoService.subCoDetailTotals$
      .subscribe((subcototalss: SubCoDetailTotals[]) => {
        this.subCoTotals = subcototalss;
      });
  }
  numberToString(no: number, precision: number = 2): string {
    return no.toLocaleString("de", { minimumFractionDigits: 0, maximumFractionDigits: precision }).replace(".", "");
  }

  getTotalsForSpecificMonth(monthId: number) {
    let revenue = 0;
    let cost = 0;
    let contribution = 0;
    let manday = 0;
    var temp = this.internalMonthRange.filter(month => month.monthId == monthId);

    temp.forEach((ie: any) => {
      manday += ie.subcontractorIntExt.manDay;
      revenue += ie.subcontractorIntExt.revenue;
      cost += ie.subcontractorIntExt.cost;
      contribution += ie.subcontractorIntExt.contribution;
    });

    temp = this.externalMonthRange.filter(month => month.monthId == monthId);

    temp.forEach((ie: any) => {
      manday += ie.subcontractorIntExt.manDay;
      revenue += ie.subcontractorIntExt.revenue;
      cost += ie.subcontractorIntExt.cost;
      contribution += ie.subcontractorIntExt.contribution;
    });

    var tempOff = this.offshoreTotalsRange.filter(month => month.monthId == monthId);

    tempOff.forEach((ie: any) => {
      manday += ie.subcontractorOffshore.totalManDays;
      revenue += ie.subcontractorOffshore.totalRevenue;
      cost += ie.subcontractorOffshore.totalCost;
      contribution += ie.subcontractorOffshore.totalContribution;
    });

    this.totalsCSVMonth = {
      manday: manday,
      revenue: revenue,
      cost: cost,
      contribution: contribution,
      cp: (contribution / revenue) * 100
    };
  }

  getTotals() {
    let revenue = 0;
    let cost = 0;
    let contribution = 0;
    let manday = 0;
    this.internalExternal.forEach((ie: SubCoFcIntExt) => {
      manday += ie.manDay;
      revenue += ie.revenue;
      cost += ie.cost;
      contribution += ie.contribution;
    })
    this.totals = {
      manday: manday,
      revenue: revenue,
      cost: cost,
      contribution: contribution,
      cp: (contribution / revenue) * 100
    };
  }

  getTotalsOffshore() {
    let revenue = 0;
    let cost = 0;
    let contribution = 0;
    let manday = 0;
    this.offshoreTotals.forEach((ie: SubCoFcOffshore) => {
      manday += ie.totalManDays;
      revenue += ie.totalRevenue;
      cost += ie.totalCost;
      contribution += ie.totalContribution;
    })
    this.totalsOffshore = {
      manday: manday,
      revenue: revenue,
      cost: cost,
      contribution: contribution,
      cp: (contribution / revenue) * 100
    };
  }

  openDashboardSubco(): void {

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
