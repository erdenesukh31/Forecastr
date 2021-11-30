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
import { FcEntryDetailDialogComponent } from "../executive-detail/fc-entry-detail-dialog.component";
import { ConfirmMessageDialog } from "../../dialogs/confirm-message/confirm-message.dialog";
import { TeamForecastService } from "../../../core/services/forecasts/team-forecasts.service";
import { PageStateService } from "../../../core/shared/page-state.service";
import { AuthService } from "../../../core/security/auth.service";
import { environment } from "../../../../environments/environment";
import { DatePipe } from "@angular/common";

/**
 * teamlead summary component
 */
@Component({
  selector: "app-subco-fc-internal",
  templateUrl: "./subco-fc-internal.html",
  styleUrls: ["./subco-fc-internal.scss"]
})
export class ExecutiveDetailComponent implements OnInit, OnDestroy {
  /**
   * month (received as input)
   */
  @Input('month') month: Month;
  @Input('months') months: Month[];

  /**
   * viewSwitch saves if the PL of PDL View is shown as Output
   */
  @Output() viewSwitch = new EventEmitter<string>();

  @Input('switchState') switchState: string;

  forecasts: FcEntry[];

  filter: string;

  /**
   * sum all FTE
   */
  fte: number;

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
  // months: Month[] = [];
  
  /**
   * team member list
   */
  team: User[] = [];

  userId: number;

  teamleads: any[] = [];
  
  teamSubscription: Subscription;

  loadingActive: boolean = false;

  totals: any = { 
    projectDays: 0, 
    billableDays: 0, 
    vacationDays: 0, 
    totalDays: 0,
    ros: 0,
    fte: 0,
    corDays: 0
  };

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
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private userService: UserService,
    private executiveService: ExecutiveForecastsService,
    private teamForecastService: TeamForecastService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private datePipe: DatePipe,
    private pageState: PageStateService,
  ) {
    this.filter = 'pdl'; // 'pdl' or 'pl'
    this.userId = this.authService.getUserId();
    this.fte=0;
    this.totals = { 
      projectDays: 0, 
      billableDays: 0, 
      vacationDays: 0, 
      totalDays: 0,
      ros: 0,
      fte: 0,
      corDays: 0
    };
  }

  /**
   * 
   */
  ngOnInit(): void {

    if(this.switchState) {
      this.filter = this.switchState;
    }
    
    this.executiveService.initializeDetailValues(this.month.id);

    this.utilitiesService.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
    });

    this.forecastService.forecasts$.subscribe((forecasts: FcEntry[]) => {
      this.fte=0;
      this.totals = { 
        projectDays: 0, 
        billableDays: 0, 
        vacationDays: 0, 
        totalDays: 0,
        ros: 0,
        fte: 0,
        corDays: 0
      };
      this.forecasts = forecasts.filter((fc: FcEntry) => fc.monthId === this.month.id);
      this.getUserValues();
      this.teamleads = this.executiveService.calculateTeamleadValues(this.filter, this.team);
    });

    this.teamSubscription = this.userService.allUsers$
      .subscribe((team: User[]) => {
        this.team = cloneDeep(team);

        this.getUserValues();
        this.teamleads = this.executiveService.calculateTeamleadValues(this.filter, this.team);
      });
    
  }

  teamFilterUpdate(filter: string): void {
    this.filter = filter;
    this.teamleads = this.executiveService.calculateTeamleadValues(this.filter, this.team);
  }

  setTeamleads(): void {
    if (this.filter === 'pl') {
      this.teamleads = this.team
        .filter((u: User) => u.roleId === 1005)
        .map((u: User) => u.id); // u.roleId === env.roles.pl
    } else {
      this.teamleads = this.team
        .filter((u: User) => u.roleId === 1002 || u.roleId === 1005)
        .map((u: User) => u.id); // u.roleId === env.roles.pdl || u.roleId === env.roles.pl
    }
  }


  clickOnEdit(id: number, firstName: string, lastName: string) {
    if(this.isEditPermitted())
    {
      this.loadingActive = true;
      
      let dialogRef: any = this.dialog.open(FcEntryDetailDialogComponent,{
        height: 'auto',
        width: 'auto',
        //panelClass: 'getSartedStepper-no-padding-dialog',
        //backdropClass: 'mat-dialog-container',
        data:{
          userId: id,
          month: this.month,
          months: this.months,
          firstName: firstName,
          lastName: lastName
        },
      });
      dialogRef.afterOpened().subscribe(result => {
        this.loadingActive = false;
      });
    }
  }

  isEditPermitted(): boolean {
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
    
    return role === 'HOP' || role === 'MSL';
  }

  isParent(user: User, parentId: number): boolean {
    if (user.parentId === parentId || parentId === user.id) {
      return true;

    } else if (this.filter === 'pl') {
      let parent: User = this.team.find((u: User) => u.id === user.parentId);
      let Parantparent: User = this.team.find((u: User) => u.id === parentId);
      if(Parantparent.permission === environment.roles.msl){
        return false;
      }
      else if (parent && parent.parentId === parentId ) {
        return true; 
      }

    }

    return false;
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

  getChildData(parentId: number): MatTableDataSource<User> {
    // let userDataArray: User[];
    // userDataArray.push(this.team.find((u: User) => u.id === parentId));
    // userDataArray.push();
    return new MatTableDataSource<User>(this.team.filter((u: User) => this.isParent(u, parentId) && this.isUserRelevantForMonth(u, this.month)));
  }

  /**
   * Return value for given type (used for arve + urve + revenue + workingdays)
   * @param type
   * @param userId
   */
  getTeamValue(type: string, userId: number): number {
    return 0;
  }
  calcARVE( projectDays: number, vacationDays: number, totalDays : number): number{
      if( ( projectDays / (totalDays - vacationDays) > 0)){
        return (projectDays / (totalDays - vacationDays)) * 100;
      }  
      else {
        return 0;
      }
  }

  calcURVE(billableDays: number, vacationDays: number, totalDays : number): number{
    if ( ( billableDays / (totalDays - vacationDays) > 0)){
      return (billableDays / (totalDays - vacationDays)) * 100;
    }
    else {
      return 0;
    }
  }
  
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
        this.setLockState(true, this.userId ,'All forecast entries are successfully submitted.', 'Forecast entries could not be submitted. Please try again later.');
      }
      
    });
  }

  setLockState(locked: boolean, role: number, messageSuccess: string, messageFail: string): void {
    let level: number = 3;
    

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

  forecastState(type: string, userId: number): boolean  {
    if (type === 'locked') {
      return this.forecasts.find((fc: FcEntry) => fc.monthId == this.month.id && fc.userId == userId && fc.locked == -1) != undefined;
    } else {
      return true;
    } 
    
    //else {
    //   return this.forecastService.checkForecastState(type, this.month.id, userId);
    // }
  }
  // forecastState(type: string, userId: number): boolean | string {
  //   if (type === 'locklevel') {
  //     return this.userService.getRoleName(this.forecastService.getForecastLockLevel(this.month.id, userId));
  //   } else {
  //     return this.forecastService.checkForecastState(type, this.month.id, userId);
  //   }
  // }

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
        //this.forecastService.unlockForecast(this.month.id, this.userId);
        this.pageState.hideSpinner();
      }
    });
  }

  /**
   * 
   * @param status 
   * changes the status of pl or pdl and sends it to parent
   */
  changeView(status: string): void {
    this.viewSwitch.emit(status);
  }

  /**
   * 
   */
  ngOnDestroy(): void {
    this.teamSubscription.unsubscribe();
  }

  public getTotal(property: string): number {
    if(property === 'ARVE') {
      return this.calcARVE(this.totals.projectDays, this.totals.vacationDays, this.totals.totalDays);
    } else if(property === 'URVE') {
      return this.calcURVE(this.totals.billableDays, this.totals.vacationDays, this.totals.totalDays);
    } else if(property === 'COR') {
      return this.totals.ros / this.totals.corDays;
    } else {
      return 3;
    }
  }

  private getUserValues(): void {
    this.team.forEach((user: any) => {
      const forecast: FcEntry = this.forecasts.find((fc: FcEntry) => fc.userId === user.id);

      if (!forecast) {
        user.projects = [];
        user.projectDays = 0;
        user.billableDays = 0;
        user.vacationDays = 0;
        user.totalDays = 0;
        user.cor = 0;
        user.ros = 0;
        user.arve = 0;
        user.urve = 0;
        user.fte = 0;
      } else {
        user.projects = forecast.projects
           ? forecast.projects
             .filter((fcp: FcProject) => this.projects.find((p: Project) => (p.id === fcp.projectId && (p.projectType === 0 || p.projectType === 5))))
             .map((fcp: FcProject) => this.projects.find(p => p.id === fcp.projectId).name)
           : [];
        user.projectDays = forecast.billableDays + forecast.nonbillableProjectDays;
        user.billableDays = forecast.billableDays;
        user.vacationDays = forecast.vacationDays;
        user.totalDays = forecast.totalDays;
        user.cor = forecast.cor ? forecast.cor : 0;
        user.ros = forecast.ros ? forecast.ros : 0;
        user.arve = (forecast.arve * 100).toFixed(0);
        user.urve = (forecast.urve * 100).toFixed(0);
        user.fte = forecast.fte ? forecast.fte : 0; // changed as it is not correct to add the users fte when the forecast fte is Null
      }
      this.fte += user.fte;

      this.totals.fte += user.fte;
      this.totals.ros += user.ros;

      if (forecast) {
        forecast.projects.forEach(fp => {
          if( fp.billable && fp.cor !== 0) {
            this.totals.corDays += fp.plannedProjectDays
          }  
        });
      }
      // forecast.projects.forEach((pe:FcProject) => { if( pe.billable && pe.plannedProjectDays !== 0)  this.totals.corDays += pe.plannedProjectDays} );

      if(forecast && forecast.isRelevant) {
        this.totals.projectDays += user.projectDays;
        this.totals.vacationDays += user.vacationDays;
        this.totals.totalDays += user.totalDays;
        this.totals.billableDays += user.billableDays;
      }
    });
  }

  exportCSV(): void {
    this.pageState.showSpinner();

    let lineEnding = "\r\n";
    let header: string = "Month;" + this.month.name + lineEnding
      + "Working Days;" + this.month.workingdays + lineEnding
      + "Name;Global ID;Prod Unit Code;FTE;Paid Days;Project Days;Billable Days;Vacation Days;ARVE;URVE;Revenue;COR"
      + lineEnding;
    
    let body = "";

    let totalPaidDays = 0;
    let totalProjectDays = 0;
    let totalBillableDays = 0;
    let totalVacationDays = 0;
    let totalROS = 0;
    let totalFTE = 0;

    this.team.forEach((user: any) => {
      
      let line = user.firstName + " " + user.lastName + ";" //Name
        + this.numberToString(user.globalId.toFixed(0)) + ";" //Global ID
        + user.prodUnitCode + ";" //Production Unit COde
        + this.numberToString(user.fte) + ";" //FTE
        + this.numberToString(user.fte * parseInt(this.month.workingdays)) + ";" //Paid Days
        + this.numberToString(user.projectDays) + ";" //Project Days
        + this.numberToString(user.billableDays) + ";" //Billable Days
        + this.numberToString(user.vacationDays) + ";" //Vactaion Days
        + this.numberToString(user.arve / 100, 4) + ";" //ARVE
        + this.numberToString(user.urve / 100, 4) + ";" //URVE
        + this.numberToString(user.ros) + ";" //ROS
        + this.numberToString(user.cor)  //COR
        + lineEnding;
      body = body + line;
      totalPaidDays += user.fte * parseInt(this.month.workingdays);
      totalProjectDays += user.projectDays;
      totalBillableDays += user.billableDays;
      totalVacationDays += user.vacationDays;
      totalROS += user.ros;
      totalFTE += user.fte
    });

    let summaryHeader = "Summary;" + this.month.name + lineEnding
      + "FTE;Paid Days;Project Days;Billable Days;Vacation Days;ARVE;URVE;Revenue;Weighted COR" 
      + lineEnding;
    let summaryLine = this.numberToString(this.totals.fte) + ";" 
      + this.numberToString(this.totals.totalDays) + ";" 
      + this.numberToString(this.totals.projectDays) + ";" 
      + this.numberToString(this.totals.billableDays) + ";" 
      + this.numberToString(this.totals.vacationDays) + ";" 
      + this.numberToString((this.totals.projectDays) / (this.totals.totalDays - this.totals.vacationDays), 4) + ";"
      + this.numberToString(this.totals.billableDays / (this.totals.totalDays - this.totals.vacationDays), 4) + ";"
      + this.numberToString(this.totals.ros) + ";"
      + this.numberToString(this.totals.ros / this.totals.corDays)
      + lineEnding;
    
    const data = header + body + lineEnding + lineEnding + summaryHeader + summaryLine;
    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-AllOverview.csv";    

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
    }
  }

  numberToString(no: number, precision: number = 2): string {
    return no.toLocaleString("de",  { minimumFractionDigits: 0, maximumFractionDigits: precision } ).replace(".","");
  }
}
