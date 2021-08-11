import { Component, OnInit, Input, OnDestroy, Output,EventEmitter, HostListener } from "@angular/core";
import { FcEntry } from "../../../core/interfaces/fcEntry";
import { UserService } from "../../../core/services/user.service";
import { User } from "../../../core/interfaces/user";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { Month } from "../../../core/interfaces/month";
import { AuthService } from "../../../core/security/auth.service";
import { FcProject } from "../../../core/interfaces/fcProject";
import { TeamForecastService } from "../../../core/services/forecasts/team-forecasts.service";
import { Subscription } from "rxjs";
import { TeamUserService } from "../../../core/services/forecasts/team-user.service";
import { UtilitiesService } from "../../../core/services/utilities.service";
import { Project } from "../../../core/interfaces/project";
import { environment as env } from '../../../../environments/environment';
import { formatDate } from '@angular/common';

/**
 * teamlead view component
 */
@Component({
  selector: "app-teamlead-month",
  templateUrl: "./teamlead-month.component.html",
  styleUrls: ["./teamlead-month.component.scss"]
})
export class TeamleadMonthComponent implements OnInit, OnDestroy {
  /**
   * month (received as input)
   */
  @Input('month') month: Month;
  @Input('role') role: string;
    /**
   * step-input-variable for angular material expansion panel
   */
  @Input('step') step: number;

  /**
   * output event to inform parent about step change
   */
  @Output() setStepEvent = new EventEmitter<number>();

  /**
   * userId (loaded from auth-service)
   */
  userId: number;

  fcEntries: FcEntry[] = [];
  team: User[] = [];
  
  /**
   * scroll-variable for scrolling into in AfterViewChecked
   */
  scrollToIndex : number;

  fcSubscription: Subscription;
  teamSubscription: Subscription;
  teamFcSubscription: Subscription;
  firstTime: boolean;

  /**
   * teamlead component constructor
   */
  constructor(
    private userService: UserService,
    private teamService: TeamUserService,
    private authService: AuthService,
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private teamForecastService: TeamForecastService,
  ) {
    this.userId = this.authService.getUserId();
  }

  /**
   * Initiates forecast-entries + team
   */
  ngOnInit(): void {
    this.firstTime = true;
    this.fcSubscription = this.forecastService.forecasts$
      .subscribe((forecasts: FcEntry[]) => {
        this.fcEntries = forecasts.filter((fc: FcEntry) => fc.monthId === this.month.id);
      });

    if (this.role === 'practice') {
      this.teamSubscription = this.teamService.teamPL$
        .subscribe((team: User[]) => {
          for (let i = 0; i < team.length; i++) {
            for (let i = 0; i < team.length; i++) {
              if(this.userId === team[i].id) {
                let tempUser: User = team[0];
                team[0] = team[i];
                team.splice(i, 1);
                team.splice(1, 0, tempUser);
              }
            }
          }
          this.team = team;
        });
    } else {
      this.teamSubscription = this.teamService.teamPDL$
        .subscribe((team: User[]) => {
          for (let i = 0; i < team.length; i++) {
            if(this.userId === team[i].id) {
              let tempUser: User = team[0];
              team[0] = team[i];
              team.splice(i, 1);
              team.splice(1, 0, tempUser);
            }
          }
          this.team = team;
        });
    }

    let level: number = 1;
    if (this.role === 'practice') {
      level = 2;
    }

    this.teamFcSubscription = this.teamForecastService
      .getTeamForecast(this.userId, this.month.id, level)
      .subscribe((fcEntries: FcEntry[]) => {
        this.forecastService.addForecasts(fcEntries);
      });
  }

  /**
   *  Called after the ngAfterViewInit() and every subsequent ngAfterContentChecked()
   *  If something in the component is clicked etc. this is called
   */
  ngAfterViewChecked() :void{
    //Check if the component already scrollled successfully
    if(this.scrollToIndex !== -1){
      let index = this.scrollToIndex == 0 ? 0 : this.scrollToIndex -1; 
      let element = document.getElementById("panel-"+ index);
      if(element){
          element.scrollIntoView({block: "start", behavior: "smooth"});
      }
    }
  }

  /**
   * Unsubscribe services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.fcSubscription.unsubscribe();
    this.teamSubscription.unsubscribe();
    this.teamFcSubscription.unsubscribe();
  }

  /**
   * Scroll of the wrapper for this component
   * @param event 
   */
  onScroll(event) {
    this.scrollToIndex = -1;
  }

  /**
   * Scroll with mousewheel
   * @param event 
   */
  @HostListener('mousewheel', ['$event']) 
  onMousewheel(event) {
    this.scrollToIndex = -1;
  }

  /**
   * Called when an expansion panel is closed
   * @param event 
   */
   ExpPanelClicked(){
    this.scrollToIndex = -1;
    this.setStepEvent.emit(-1);
  }

  /**
   * Return value for given type (used for arve + urve + revenue + workingdays)
   * @param type
   * @param userId
   */
  getValue(type: string, userId: number): any {
    let fc: FcEntry = this.fcEntries.find((e: FcEntry) => e.userId === userId);
    if (!fc) {
      if (type === 'totaldays') {
        let u: User = this.userService.getUser(userId);
        if (u && u.fte) {
          return u.fte * parseInt(this.month.workingdays, 10);
        } else {
          return parseInt(this.month.workingdays, 10);
        }
      }
      return 0;
    }

    if (type === 'arve' && typeof fc.arve === 'number') {
      return parseFloat((fc.arve * 100).toFixed(0));

    } else if (type === 'urve' && typeof fc.urve === 'number') {
      return parseFloat((fc.urve * 100).toFixed(0));

    } else if (type === 'totaldays') {
      if (typeof fc.fte !== 'undefined') {
        return parseInt(this.month.workingdays, 10) * fc.fte;
      } else {
        return parseInt(this.month.workingdays, 10);
      }

    } else if (fc.projects && fc.projects.length > 0) {
      if (type === 'billabledays') {
        return fc.projects
          .map((p: FcProject) => ((p.plannedProjectDays && p.billable) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'projectdays') {
        let projectIds: number[] = this.utilitiesService.getProjects()
          .filter((p: Project) => (p.projectType === env.projectTypes.default || p.projectType === env.projectTypes.nonbillable))
          .map((p: Project) => p.id);

        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays && (projectIds.indexOf(p.projectId) >= 0) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'vacationdays') {
        let projectIds: number[] = this.utilitiesService.getProjects()
          .filter((p: Project) => (p.projectType === env.projectTypes.vacationdays))
          .map((p: Project) => p.id);

        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays && (projectIds.indexOf(p.projectId) >= 0) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'benchdays') {
        let projectIds: number[] = this.utilitiesService.getProjects()
          .filter((p: Project) => (p.projectType === env.projectTypes.benchdays))
          .map((p: Project) => p.id);

        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays && (projectIds.indexOf(p.projectId) >= 0) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'trainingdays') {
        let projectIds: number[] = this.utilitiesService.getProjects()
          .filter((p: Project) => (p.projectType === env.projectTypes.trainingdays))
          .map((p: Project) => p.id);

        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays && (projectIds.indexOf(p.projectId) >= 0) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'businessdays') {
        let projectIds: number[] = this.utilitiesService.getProjects()
          .filter((p: Project) => (p.projectType === env.projectTypes.businessdays))
          .map((p: Project) => p.id);

        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays && (projectIds.indexOf(p.projectId) >= 0) ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'workingdays') {
        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'revenue') {
        return fc.projects
          .map((p: FcProject) => ((p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.cor ? p.cor : 0)))
          .reduce((pSum: number, a: number) => pSum + a);

      }
      else if (type === 'history') {
        if (fc.history && fc.history.length > 0 && fc.history[0].createdAt) {
          let date: string = formatDate(fc.history[0].createdAt, 'dd.MM.yyyy', 'en');
          return  'Last updated from ' + fc.changedBy + ', ' + date;
        }
      }
    }

    return 0;
  }

  forecastState(type: string, userId: number): boolean | string {
    if (type === 'locklevel') {
      return this.userService.getRoleName(this.forecastService.getForecastLockLevel(this.month.id, userId));
    } else {
      return this.forecastService.checkForecastState(type, this.month.id, userId);
    }
  }

  working(user: User, month: Month): boolean {
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
   * Set index for accordion
   * @param index
   */
  setStep(index: number): void {
    this.scrollToIndex = index;
    this.step = index;
    this.setStepEvent.emit(index);
  }

  /**
   * Go to next accordion
   */
  nextStep(): void {
    this.step++;
  }

  /**
   * Go to previous accordion
   */
  prevStep(): void {
    this.step--;
  }
}
