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
import { FcProject } from "../../../core/interfaces/fcProject";

/**
 * teamlead summary component
 */
@Component({
  selector: "app-teamlead-summary",
  templateUrl: "./teamlead-summary.component.html",
  styleUrls: ["./teamlead-summary.component.scss"]
})
export class TeamleadSummaryComponent implements OnInit, OnDestroy {
  /**
   * month (received as input)
   */
  @Input('month') month: Month;
  @Input('role') role: string;

  /**
   * list of all forecast entries for teamlead + month
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
   * team member list
   */
  team: User[] = [];

  /**
   * contains summary-data (calculated in teamlead-summary service)
   */
  summaryData: SummaryData;

  /**
   * provides summary-data projects in 'MatTableDataSource' format
   */
  summaryProjects: MatTableDataSource<SummaryDataProject>;

  /**
   * forecast subscription
   */
  fcSubscription: Subscription;

  /**
   * team subscription
   */
  teamSubscription: Subscription;

  userId: number;

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
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private teamForecastService: TeamForecastService,
    private userService: UserService,
    private teamService: TeamUserService,
    private authService: AuthService,
    private pageState: PageStateService,
  ) {
    this.fcEntries = [];
    this.summaryProjects = new MatTableDataSource([]);
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

    if (this.role === 'practice') {
      this.teamSubscription = this.teamService.teamPL$
        .subscribe((team: User[]) => {
          this.team = team;
        });
    } else {
      this.teamSubscription = this.teamService.teamPDL$
        .subscribe((team: User[]) => {
          this.team = team;
        });
    }

    this.fcSubscription = this.forecastService.forecasts$
      .subscribe((forecasts: FcEntry[]) => {
        let relevantUsers: User[] = this.team.filter((u: User) => this.isUserRelevantForMonth(u, this.month));
        let userIds: number[] = relevantUsers.map((u: User) => u.id);
        this.fcEntries = forecasts.filter((fc: FcEntry) => fc.monthId === this.month.id && userIds.indexOf(fc.userId) >= 0);
        this.summaryData = this.teamForecastService.getSummaryData(this.fcEntries, parseInt(this.month.workingdays, 10), relevantUsers);
        this.summaryProjects = new MatTableDataSource(this.summaryData.days);
      });
  }

  isUserRelevantForMonth(user: User, month: Month) : boolean {
    if(user.endDate && user.startDate && month.time) {
      var endMonth = new Date(user.endDate);
      endMonth = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);
      var startMonth = new Date(user.startDate);
      startMonth = new Date(startMonth.getFullYear(), endMonth.getMonth(), 1);
      var monthMonth = new Date(month.time);
      monthMonth = new Date(monthMonth.getFullYear(), monthMonth.getMonth(), 1)
      if(startMonth <= endMonth) {
        if(monthMonth > endMonth) {
          return false;
        }
      } else if(startMonth > endMonth) {
        if(monthMonth <= startMonth && monthMonth >= endMonth) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.fcSubscription.unsubscribe();
    this.teamSubscription.unsubscribe();
  }

  /**
   * Return for giving VALUE percentage value.
   * @param value
   */
  percentageValue(value: number): number {
    return parseFloat((value * 100).toFixed(0));
  }

  allForecastsValid(): boolean {
    let disbaled = false;
    this.fcEntries.forEach((e: FcEntry)=> {
      e.projects.forEach((p: FcProject) =>{
        if(p.probabilityId === null || e.updated){
          disbaled = true;
        }
      })
      if(e.fte === null || e.updated){
        disbaled = true;
      }
    });
    return disbaled;
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

  unlockAll(): void {
    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
      data: {
        message: 'Are you sure you want to unlock all forecasts?',
        button: { cancel: 'No', submit: 'Yes' },
      },
    });
    dialogRef.afterClosed().subscribe((submit: boolean) => {
      if (submit === true) {
        this.pageState.showSpinner();
        for(let member of this.team) {
          this.forecastService.unlockForecast(this.month.id, member.id);
        }
        this.forecastService.unlockForecast(this.month.id, this.userId);
        this.pageState.hideSpinner();
      }
    });
  }

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

    this.teamForecastService.setForecastsLockState(this.month.id, level, locked)
      .then((forecasts: FcEntry[]) => {
        if (forecasts) {
          this.forecastService.addForecasts(forecasts, true);
        } else {
          this.forecastService.setTeamLockState(this.month.id, level, role);
        }

        this.snackBar.open(messageSuccess, 'OK', { duration: 10000, });
        this.pageState.hideSpinner();
      }).catch(() => {
        this.snackBar.open(messageFail, 'OK', { duration: 10000, });
        this.pageState.hideSpinner();
      });
  }

  /**
   * Returns whether the logged in user has a practice lead role
   */
  hasPracticeLeadRole(): boolean {
    return this.authService.hasRole(env.roles.pl);
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
   * Export forecasts for team for the selected months
   */
  exportPeriodForecastToCSV(csvExportMonths: number[]): void {
    this.pageState.showSpinner();
    let openRequests: number = csvExportMonths.length;

    let level: number = 1;
    if (this.role === 'practice') {
      level = 2;
    }
    let summaryMap = new Map();
    let monthSummaries: string[] = [];
    let lineEnding = "\r\n";
    let header = "Name;Grade;FTE;Paid Days;Project Days;Billable Days;Vacation Days;Training Days;Business Development Days;Bench Days;ARVE;URVE;External Revenue;Internal Revenue;Revenue;Weighted COR" + lineEnding;
    let summaryHeader = "FTE;Paid Days;Project Days;Billable Days;Vacation Days;Training Days;Business Development Days;Bench Days;ARVE;URVE;External Revenue;Internal Revenue;Revenue;Weighted COR" + lineEnding;

    this.utilitiesService.getMonths().forEach((month: Month) => {
      if (csvExportMonths.indexOf(month.id) >= 0) {
        this.teamForecastService.getTeamForecastPromise(this.userId, month.id, level).then((fcEntries: FcEntry[]) => {
          let monthSummary: string = "Month;" + month.name + lineEnding + "Working Days;" + month.workingdays + lineEnding;
          monthSummary += header;

          let totalExternal: number = 0;
          let totalInternal: number = 0;
          let totalRevenue: number = 0;

          let totalFTE: number = 0;

          let totalBDD: number = 0;
          let totalVaction: number = 0;
          let totalTraining: number = 0;
          let totalBench: number = 0;
          let totalProject: number = 0;
          let totalBillable: number = 0;
          let totalPaid: number = 0;
          let totalNonBillable: number = 0;

          let totalCOR: number = 0;

          for(var fc of fcEntries) {
            let user = this.userService.getUser(fc.userId);
            let userName = user.firstName + " " + user.lastName;
            
            let grade = this.userService.getGrades().find((grade: Grade) => grade.gradeId === fc.gradeId);
            let gradeName = grade.name;

            let externalRevenue: number = 0;
            let internalRevenue: number = 0;
            let revenue: number = 0;

            let bddDays: number = 0;
            let vacationDays: number = 0;
            let trainingDays: number = 0;
            let benchDays: number = 0;
            let projectDays: number = 0;
            let billableDays: number = 0;
            let nonBillableDays: number = 0;

            let paidDays: number = parseInt(month.workingdays) * fc.fte;

            let cor: number = 0;

            for(var pj of fc.projects) {
              if(pj.projectType === 1 || pj.projectType === 6) {
                projectDays += pj.plannedProjectDays;
              }

              if(pj.projectType === 2) {
                bddDays += pj.plannedProjectDays;
              } else if(pj.projectType === 3) {
                trainingDays += pj.plannedProjectDays;
              } else if(pj.projectType === 4) {
                vacationDays += pj.plannedProjectDays;
              } else if(pj.projectType === 5) {
                benchDays += pj.plannedProjectDays;
              }

              if(pj.billable && (pj.projectType === 1 || pj.projectType === 6)) {
                let rev = pj.cor * pj.plannedProjectDays;
                cor += rev;
                if(pj.externalRevenue) {
                  externalRevenue += rev;
                } else {
                  internalRevenue += rev;
                }

                billableDays += pj.plannedProjectDays;
                revenue += rev;
              } else if(!pj.billable && (pj.projectType === 1 || pj.projectType === 6)) {
                nonBillableDays += pj.plannedProjectDays;
              }
            }

            let monthEntry: string = userName + ";" + 
              gradeName + ";" + 
              this.numberToString(fc.fte) + ";" + 
              this.numberToString(paidDays) + ";" + 
              this.numberToString(projectDays) + ";" + 
              this.numberToString(billableDays) + ";" + 
              this.numberToString(vacationDays) + ";" + 
              this.numberToString(trainingDays) + ";" + 
              this.numberToString(bddDays) + ";" + 
              this.numberToString(benchDays) + ";" + 
              this.numberToString((billableDays + nonBillableDays)/(paidDays - vacationDays), 4) + ";" + 
              this.numberToString((billableDays)/(paidDays - vacationDays), 4) + ";" + 
              this.numberToString(externalRevenue) + ";" + 
              this.numberToString(internalRevenue) + ";" + 
              this.numberToString(revenue) + ";" +
              this.numberToString(cor / billableDays) +
              lineEnding;

            totalExternal += externalRevenue;
            totalInternal += internalRevenue;
            totalRevenue += revenue;

            totalFTE += fc.fte;

            totalBDD += bddDays;
            totalVaction += vacationDays;
            totalTraining += trainingDays;
            totalBench += benchDays;
            totalProject += projectDays;
            totalBillable += billableDays;
            totalNonBillable += nonBillableDays;

            totalPaid += paidDays;

            totalCOR += cor;

            monthSummary += monthEntry;
          }

          let monthTotalEntry = this.numberToString(totalFTE) + ";" + 
            this.numberToString(totalPaid) + ";" + 
            this.numberToString(totalProject) + ";" + 
            this.numberToString(totalBillable) + ";" + 
            this.numberToString(totalVaction) + ";" + 
            this.numberToString(totalTraining) + ";" + 
            this.numberToString(totalBDD) + ";" + 
            this.numberToString(totalBench) + ";" + 
            this.numberToString((totalBillable + totalNonBillable) / (totalPaid - totalVaction), 4) + ";" + 
            this.numberToString((totalBillable) / (totalPaid - totalVaction), 4) + ";" + 
            this.numberToString(totalExternal) + ";" + 
            this.numberToString(totalInternal) + ";" + 
            this.numberToString(totalRevenue) + ";" +
            this.numberToString(totalCOR / totalBillable) +
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