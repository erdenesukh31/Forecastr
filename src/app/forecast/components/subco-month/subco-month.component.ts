import { Component, OnInit, Input, OnDestroy, Output,EventEmitter, HostListener } from "@angular/core";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { AddSubcoDialogEm } from "../../dialogs/add-subco-em/add-subco-em.dialog";
import { ConfirmMessageDialog } from '../../dialogs/confirm-message/confirm-message.dialog';

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
  isStepping: boolean;
  showDialog: boolean;

  /**
   * teamlead component constructor
   */
  constructor(
    private userService: UserService,
    private subcoService: SubCoService,
    private utilitiesService: UtilitiesService,
    private authService: AuthService,
    private dialog: MatDialog,

    private subcoForecastService: SubCoForecastService,
  ) {
    this.userId = this.authService.getUserId();
  }

  /**
   * Initiates forecast-entries + team
   */
  ngOnInit(): void {
    this.firstTime = true;
    this.isStepping = false;
    this.showDialog = true;
    this.subcoForecastService.initSubCoDetailsByMonth(this.month.id, this.userId);
    this.subcoService.initSubCoPreviewById(this.userId);

    this.subcoService.subCoPreviews$.subscribe((subcos: SubCoPreview[]) =>{
      this.subcos = subcos;
    });
    this.subcoForecastService.subcoDetails$.subscribe((subcos: SubCoDetails[]) => {
      this.subcosDetails = subcos;
      this.showCopyDataDialog(subcos);
    });
  }

  showCopyDataDialog(subcosDetails): void{
    subcosDetails.forEach(subco =>{
      if(this.showDialog && subco.projectName === 'Placeholder'){
        let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
          data: {
            message: 'Copy data from last month submitted?',
            button: { cancel: 'No', submit: 'Yes' },
          },
        });

        dialogRef.afterClosed().subscribe((add: boolean) => {
          if (add === false) {
            this.subcosDetails.forEach(details => {
              if(subco.projectName === 'Placeholder')
                details.projectId = 0;
            })
          }
        });
        this.showDialog = false;
      }
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

  forecastState(type: string, userId: number): boolean | string {
    return false;
  }

  working(user: SubCoPreview, month: Month): boolean {
    return true;
  }

  /**
   * Return value for given type 
   * @param type
   * @param subcoId
   */
  getValue(type: string, subcoId: number): any {
    let subco: SubCoPreview = this.subcos.find((e: SubCoPreview) => e.subcontractorId === subcoId);
    let details = this.subcosDetails.find(d => d.subcontractorId === subcoId && d.monthId ===this.month.id);

    if (!details) {
      return 0;
    }
    if (details) {
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
        return details.cp*100;

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

  /**
   * Set step for accordion
   * @param index
   */
  setStep(index: number): void {
    this.scrollToIndex = index;
    this.step = index;
    this.setStepEvent.emit(index);
  }

  /**
   * Called when an expansion panel is closed
   * @param event 
   */
  ExpPanelClicked(){
    if(!this.isStepping){
      this.scrollToIndex = -1;
      this.setStepEvent.emit(-1);
    }
    this.isStepping = false;
  }
  

  /**
   * Go to next accordion
   */
  nextStep(): void {
    this.isStepping = true;
    this.step++;
  }

  /**
   * Go to previous accordion
   */
  prevStep(): void {
    this.isStepping = true;
    this.step--;
  }

   /**
   * open add subco dialog
   */
    addNewSubco(): void {
      this.openUserDialog(new SubCoPreview());
    } 

      /**
   * open update user dialog
   * @param user
   */
  openUserDialog(subco: SubCoPreview): void {
    let dialogRef: any = this.dialog.open(AddSubcoDialogEm, { height: 'auto', width: '50vw', data: subco });

    dialogRef.afterClosed().subscribe((s: SubCoPreview | boolean) => {
      if (s) {
        var temp = s as SubCoPreview;
        temp.subcontractorEmId = this.userId;
        this.subcoService.setSubco(<SubCoPreview>temp);
      }
    });
  }
}
