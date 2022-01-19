import { Component, OnInit, Input, OnChanges, OnDestroy, Inject } from "@angular/core";
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";

import { UtilitiesService } from "../../../core/services/utilities.service";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { UserService } from "../../../core/services/user.service";
import { AuthService } from "../../../core/security/auth.service";

import { FcEntry } from "../../../core/interfaces/fcEntry";
import { Project } from "../../../core/interfaces/project";
import { Month } from "../../../core/interfaces/month";
import { User } from "../../../core/interfaces/user";
import { Grade } from "../../../core/interfaces/grade";
import { SummaryData, SummaryDataProject } from '../../../core/interfaces/summaryData';

import { TeamForecastService } from "../../../core/services/forecasts/team-forecasts.service";
import { Subscription } from "rxjs";
import { PageStateService } from "../../../core/shared/page-state.service";
import { environment as env } from '../../../../environments/environment';
import { TeamUserService } from "../../../core/services/forecasts/team-user.service";
import { ExportCsvDialog } from "../../dialogs/export-csv/export-csv.dialog";
import { ConfirmMessageDialog } from "../../dialogs/confirm-message/confirm-message.dialog";
import { SubCoService } from "../../../core/services/subCo.service";
import { SubCoDetails } from "../../../core/interfaces/subCoDetails";
import { SubcoSummaryData } from "../../../core/interfaces/subcoSummaryData";
import { SubCoForecastService } from "../../../core/services/subCoForecast.service";
import { SubCoTotals } from "../../../core/interfaces/subCoTotals";

/**
 * subco summary component
 */
@Component({
  selector: "app-subco-summary",
  templateUrl: "./subco-summary.component.html",
  styleUrls: ["./subco-summary.component.scss"]
})
export class SubcoSummaryComponent implements OnInit, OnDestroy {
  /**
   * month (received as input)
   */
  @Input('month') month: Month;
  @Input('role') role: string;

  /**
   * list of all forecast entries for subco + month
   */
  fcEntries: FcEntry[];

  /**
   * project list
   */
  projects: Project[] = [];

  /**
   * months list
   */
  months: Month[] = [];
  
  /**
   * subcos member list
   */
  subcos: SubCoDetails[] = []; //TODO: Replace with subcos

  /**
   * contains summary-data (calculated in subco-summary service)
   */
  summaryData: SubcoSummaryData;

  /**
   * contains totals-data 
   */
  subCoTotals: SubCoTotals;
  /**
   * provides summary-data projects in 'MatTableDataSource' format
   */
  // summaryProjects: MatTableDataSource<SummaryDataProject>;

  /**
   * forecast subscription
   */
  fcSubscription: Subscription;

  /**
   * subcos subscription
   */
  subcosSubscription: Subscription;


  userId: number;
  totalsSubscription: Subscription;

  /**
   * constructor for subco-summary component
   * @param datePipe
   * @param dialog
   * @param utilitiesService
   * @param subcoForecastService
   * @param subcoForecastService
   * @param userService
   * @param pageState
   */
  constructor(
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private utilitiesService: UtilitiesService,
    private subcoForecastService: SubCoForecastService,
    private userService: UserService,
    private subcoService: SubCoService, //TODO: Replace with SubcoService
    private authService: AuthService,
    private pageState: PageStateService,
  ) {
    this.fcEntries = [];
    // this.summaryProjects = new MatTableDataSource([]);
    this.userId = this.authService.getUserId();
  }

  /**
   * Init summaryDays
   * Set Utilities
   * Calc Total workingDays
   * Subscribe forecast at ForecastService for updates
   */
  ngOnInit(): void {
    this.projects = this.utilitiesService.getProjects();
    this.months = this.utilitiesService.getMonths();
    this.subcoService.initializeSubcoTotalsForMonth(this.month.id);

    this.subcosSubscription = this.subcoService.allSubCoDetails$ //TODO: replace
      .subscribe((subco: SubCoDetails[]) => {
        this.subcos = subco;
      });

    this.fcSubscription = this.subcoForecastService.subcoDetails$
      .subscribe((forecasts: SubCoDetails[]) => {
        this.summaryData = this.subcoService.getSummaryData(forecasts);
      });
      
      this.totalsSubscription = this.subcoService.subCoTotals$
      .subscribe((subcototalss: SubCoTotals) => {
        this.subCoTotals = subcototalss;
      });
  }

  //TODO: is this relevant
  isSubcoRelevantForMonth(user: SubCoDetails, month: Month) : boolean {
    // if(user. && user.startDate && month.time) {
    //   var endMonth = new Date(user.endDate);
    //   endMonth = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);
    //   var startMonth = new Date(user.startDate);
    //   startMonth = new Date(startMonth.getFullYear(), endMonth.getMonth(), 1);
    //   var monthMonth = new Date(month.time);
    //   monthMonth = new Date(monthMonth.getFullYear(), monthMonth.getMonth(), 1)
    //   if(startMonth <= endMonth) {
    //     if(monthMonth > endMonth) {
    //       return false;
    //     }
    //   } else if(startMonth > endMonth) {
    //     if(monthMonth <= startMonth && monthMonth >= endMonth) {
    //       return false;
    //     }
    //   }
    // }
    return true;
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.fcSubscription.unsubscribe();
    this.subcosSubscription.unsubscribe();
  }

  /**
   * Return for giving VALUE percentage value.
   * @param value
   */
  percentageValue(value: number): number {
    return parseFloat((value * 100).toFixed(0));
  }

  /**
   * Submit all forecasts at once
   */
  submitAll(): void {
    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
      data: {
        message: 'Are you sure you want to submit all forecasts?',
        button: { cancel: 'No', submit: 'Yes' },
      },
    });

    dialogRef.afterClosed().subscribe((submit: boolean) => {
      if (submit === true) {
        this.pageState.showSpinner();
        this.setLockState(true, this.userId, 'All forecast entries are successfully submitted.', 'Forecast entries could not be submitted. Please try again later.');
      }
      
    });
  }

  // unlockAll(): void {
  //   let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
  //     data: {
  //       message: 'Are you sure you want to unlock all forecasts?',
  //       button: { cancel: 'No', submit: 'Yes' },
  //     },
  //   });
  //   dialogRef.afterClosed().subscribe((submit: boolean) => {
  //     if (submit === true) {
  //       this.pageState.showSpinner();
  //       for(let member of this.subcos) {
  //         this.subcoForecastService.unlockForecast(this.month.id, member.subcontractorId);
  //       }
  //       this.subcoForecastService.unlockForecast(this.month.id, this.userId);
  //       this.pageState.hideSpinner();
  //     }
  //   });
  // }

  /**
   * Reset all forecasts to initial state DEACTIVATED
   */
  // resetAll(): void {
  //   let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
  //     data: {
  //       message: 'Are you sure you want to re-initialize all forecasts?',
  //       button: { cancel: 'No', submit: 'Yes' },
  //     },
  //   });

  //   dialogRef.afterClosed().subscribe((submit: boolean) => {
  //     if (submit === true) {
  //       this.pageState.showSpinner();
  //       this.setLockState(false, -1, 'All forecast entries are successfully re-initialized.', 'Forecast entries could not be re-initialized. Please try again later.');
  //     }
  //   });
  // }

  setLockState(locked: boolean, role: number, messageSuccess: string, messageFail: string): void {
    let level: number = 1;
    if (this.role === 'practice') {
      level = 2;
    }

    // this.subcoService.setForecastsLockState(this.month.id, this.userId, locked)
    //   .then((forecasts: FcEntry[]) => {
    //     if (forecasts) {
    //       this.forecastService.addForecasts(forecasts, true);
    //     } else {
    //       this.forecastService.setTeamLockState(this.month.id, level, role); //TODO: Replace
    //     }

    //     this.snackBar.open(messageSuccess, 'OK', { duration: 10000, });
    //     this.pageState.hideSpinner();
    //   }).catch(() => {
    //     this.snackBar.open(messageFail, 'OK', { duration: 10000, });
    //     this.pageState.hideSpinner();
    //   });
  }

  /**
   * Returns whether the logged in user has a practice lead role
   */
  hasPracticeLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pl);
  }
  isFinancialController(): boolean {
    return this.authService.hasRole(env.roles.fc);
  }
  
  /**
   * Open csv export modal to choose which data to export
   */
  openCSVExportModal(): void {
    let dialogRef: any = this.dialog.open(ExportCsvDialog, {
      width: '30vw',
      maxHeight: '80vh',
      data: { months: this.months.filter((m: Month) => m.active === true) },
    });

    dialogRef.afterClosed().subscribe((csvExportMonths: number[]) => {
      if (csvExportMonths) {
        this.exportPeriodForecastToCSV(csvExportMonths);
      }
    });
  }

  /**
   * Export forecasts for subcos for the selected months
   */
  exportPeriodForecastToCSV(csvExportMonths: number[]): void {
    this.pageState.showSpinner();
    let openRequests: number = csvExportMonths.length;

    let level: number = 1;
    let summaryMap = new Map();
    let monthSummaries: string[] = [];
    let lineEnding = "\r\n";
    let header = "Resource;Project Name;Customer;Cost Rate;Cor;Man Day;Revenue;Cost;Contribution;CP%;"+ lineEnding;
    let summaryHeader = "Total Revenue;Total Cost;Total Contribution;Total CP%;" + lineEnding;

    this.utilitiesService.getMonths().forEach((month: Month) => {
      if (csvExportMonths.indexOf(month.id) >= 0) {
        this.subcoForecastService.getForecastPromise(month.id).then((details: SubCoDetails[]) => {
          let monthSummary: string = "Month;" + month.name + lineEnding + "Working Days;" + month.workingdays + lineEnding;
          monthSummary += header;

          let totalContribution: number = 0;
          let totalCosts: number = 0;
          let totalRevenue: number = 0;
          let totalCP: number = 0;

          for(var d of details) {
            let monthEntry: string = d.resourceName + ";" + 
              d.projectName + ";" + 
              d.customer + ";" + 
              this.numberToString(d.costRate) + ";" + 
              this.numberToString(d.cor) + ";" + 
              this.numberToString(d.manDay) + ";" + 
              this.numberToString(d.revenue) + ";" + 
              this.numberToString(d.cost) + ";" + 
              this.numberToString(d.contribution) + ";" + 
              this.numberToString(d.cp  * 100) + ";" + 
              lineEnding;

            totalContribution += d.contribution;
            totalCosts += d.cost;
            totalRevenue += d.revenue;
            totalCP += d.cp;

            monthSummary += monthEntry;
          }

          let monthTotalEntry = 
            this.numberToString(totalRevenue) + ";" + 
            this.numberToString(totalCosts) + ";" + 
            this.numberToString(totalContribution) + ";" + 
            this.numberToString(totalCP) + ";" + 
            lineEnding;

          monthSummary += "\n\n" + "Summary\n" + summaryHeader + monthTotalEntry + "\n";
          openRequests--;
          summaryMap = summaryMap.set(month.id, monthSummary);

          if (openRequests === 0) {
            this.pageState.hideSpinner();
            let keys = Array.from(summaryMap.keys()).sort();

            for(var key of keys) {
              monthSummaries.push(summaryMap.get(key));
            }

            const data = monthSummaries.join("\n\n");
            const blob: Blob = new Blob([data], { type: "text/csv" });
            const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-Summary.csv";    
    
            let navigator:any = window.navigator;
            if (navigator.msSaveOrOpenBlob) {
              navigator.msSaveOrOpenBlob(blob, filename);
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
        });
      }
    });
  }

  numberToString(no: number, precision: number = 2): string {
    return no.toLocaleString("de",  { minimumFractionDigits: precision } ).replace(".","");
  }
}