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
import { SubCoDetails } from "../../../core/interfaces/subCoDetails";
import { SubCoService } from "../../../core/services/subCo.service";
import { SubCoPreview } from "../../../core/interfaces/subCoPreview";
import { SubCoForecastService } from "../../../core/services/subCoForecast.service";

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

  subcos: SubCoPreview[] = []; 
  subcosDetails: SubCoDetails[] = []; 
  allSubcosPre: SubCoPreview[] = []; 
  
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
    private subcoService: SubCoService,
    private utilitiesService: UtilitiesService,
    private authService: AuthService,

    private subcoForecastService: SubCoForecastService,
  ) {
    this.userId = this.authService.getUserId();
  }

  /**
   * Initiates forecast-entries + team
   */
  ngOnInit(): void {
    this.firstTime = true;
    this.subcoForecastService.initSubCoForecastByMonth(this.month.id, this.userId);
    this.subcoService.initSubCoPreviewById(this.userId);
    // this.subcoService.initializeAllSubCoPreviews();
    // this.subcoService.initializeAllSubCoDetails();

    this.subcoService.subCoPreviews$.subscribe((subcos: SubCoPreview[]) => this.subcos = subcos);
    this.subcoForecastService.subcoDetails$.subscribe((subcos: SubCoDetails[]) => this.subcosDetails = subcos);
    // this.subcoService.allSubCoPreviews$.subscribe((subcos: subCoPreview[]) => this.allSubcosPre = subcos);
    // this.subcoService.allSubCoDetails$.subscribe((subcos: SubCoDetails[]) => this.allSubcosDetails = subcos);

    let level: number = 1;
    if (this.role === 'practice') {
      level = 2;
    }
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
    let subco: SubCoPreview = this.subcos.find((e: SubCoPreview) => e.subcontractorId === subcoId);
    let details = this.subcosDetails.find(d => d.subcontractorId === subcoId && d.monthId ===this.month.id);

    if (!subco) {
      return 0;
    }
    if (subco) {
      if (type === 'costRate') {
        return details.costRate;
      }
      else if (type === 'cor') {
        return details.cor;
      }
      else if (type === 'manDay') {
        return details.manDay;

      } else if (type === 'revenue') {
        return details.revenue;

      } else if (type === 'costs') {
        return details.cost;

      } else if (type === 'contribution') {
        return details.contribution;

      } else if (type === 'cp') {
        return details.cp;

      }
      else if (type === 'history') {
        // if (subco.history && subco.history.length > 0 && subco.history[0].createdAt) {
        //   let date: string = formatDate(subco.history[0].createdAt, 'dd.MM.yyyy', 'en');
        //   return  'Last updated from ' + subco.changedBy + ', ' + date;
        // }
        return 0;
      }
    }

    return 0;
  }

  forecastState(type: string, userId: number): boolean | string {
    // if (type === 'locklevel') {
    //   return this.userService.getRoleName(this.subcoForecastService.getForecastLockLevel(this.month.id, userId));
    // } else {
    //   return this.subcoForecastService.checkForecastState(type, this.month.id, userId);
    // }
    return false;
  }

  working(user: SubCoPreview, month: Month): boolean {
    // if(month.time) {
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
