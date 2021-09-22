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
  selector: "app-subco-month",
  templateUrl: "./subco-month.component.html",
  styleUrls: ["./subco-month.component.scss"]
})
export class SubcoMonthComponent implements OnInit, OnDestroy {
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
  subcos: User[] = []; //TODO: Replace User with Subcos
  
  /**
   * scroll-variable for scrolling into in AfterViewChecked
   */
  scrollToIndex : number;

  fcSubscription: Subscription;
  subcoSubscription: Subscription;
  subcoFcSubscription: Subscription; //TODO: Probably do not need that
  firstTime: boolean;

  /**
   * teamlead component constructor
   */
  constructor(
    private userService: UserService,
    private subcoService: TeamUserService, //TODO: Needs to be changed
    private authService: AuthService,
    private utilitiesService: UtilitiesService,
    private forecastService: ForecastService,
    private teamForecastService: TeamForecastService, //TOD: Needs tp be changed or removed
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

    this.subcoSubscription = this.subcoService.teamPDL$
      .subscribe((subcos: User[]) => { //TODO: Replace
        for (let i = 0; i < subcos.length; i++) {
          if(this.userId === subcos[i].id) {
            let tempUser: User = subcos[0];
            subcos[0] = subcos[i];
            subcos.splice(i, 1);
            subcos.splice(1, 0, tempUser);
          }
        }
        this.subcos = subcos;
      });

    let level: number = 1;
    if (this.role === 'practice') {
      level = 2;
    }

    this.subcoFcSubscription = this.teamForecastService
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
    this.subcoSubscription.unsubscribe();
    this.subcoFcSubscription.unsubscribe();
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
   * Return value for given type 
   * @param type
   * @param subcoId
   */
  getValue(type: string, subcoId: number): any {
    let fc: FcEntry = this.fcEntries.find((e: FcEntry) => e.userId === subcoId); //TODO: Replace with SubcoForecast and subcoId
    if (!fc) {
      return 0;
    }
    if (fc.projects && fc.projects.length > 0) {
      if (type === 'costRate') {
        return fc.projects
          .map((p: FcProject) => (p.costRate ? p.costRate : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      }
      else if (type === 'cor') {
        return fc.projects
        .map((p: FcProject) => (p.cor ? p.cor : 0))
        .reduce((pSum: number, a: number) => pSum + a);
        
      }
      else if (type === 'manDay') {
        return fc.projects
          .map((p: FcProject) => (p.plannedProjectDays ? p.plannedProjectDays : 0))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'revenue') {
        return fc.projects
          .map((p: FcProject) => ((p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.cor ? p.cor : 0)))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'costs') {
        return fc.projects
          .map((p: FcProject) => ((p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.costRate ? p.costRate : 0)))
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'contribution') {
        return fc.projects
          .map((p: FcProject) =>{
            let revenue = (p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.cor ? p.cor : 0);
            let costs = (p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.costRate ? p.costRate : 0);
            return revenue - costs;
          }) 
          .reduce((pSum: number, a: number) => pSum + a);

      } else if (type === 'cp') {
        return fc.projects
          .map((p: FcProject) =>{
            let revenue = (p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.cor ? p.cor : 0);
            let costs = (p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.costRate ? p.costRate : 0);
            let contribution = revenue - costs;
            return contribution / revenue;
          })
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
