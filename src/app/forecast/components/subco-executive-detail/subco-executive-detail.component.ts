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
import { environment } from "../../../../environments/environment";
import { DatePipe } from "@angular/common";
import { SubCoFcIntExt } from "../../../core/interfaces/subCoFcIntExt";
import { SubCoFcOffshore } from "../../../core/interfaces/subCoFcOffshore";
import { getMultipleValuesInSingleSelectionError } from "@angular/cdk/collections";
import { SubCoFinancialControllerService } from "../../../core/services/subCoFinancialController.service";
import {SubcoSummaryComponent} from "../subco-summary/subco-summary.component";

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
  offshoreTotals: SubCoFcOffshore;

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
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private datePipe: DatePipe,
    private pageState: PageStateService,
  ) {
    this.filter = 'internal'; // 'internal', 'external' or 'offshore'
    this.userId = this.authService.getUserId();
    this.fte=0;
    this.totals = { 
      revenue: 0, 
      cost: 0, 
      contribution: 0,
      cp: 0
    };
  }

  /**
   * 
   */
  ngOnInit(): void {

    if(this.switchState) {
      this.filter = this.switchState;
    }

    this.subcoFinancialControllerService.initSubCoOffshoreForMonth(this.month.id);

    this.getValues(); 
  }

  getValues() {
    switch(this.filter){
      case 'external':
        this.subcoFinancialControllerService.initSubCoExternalForMonth(this.month.id);

        this.subcoFinancialControllerService.intExtSubCo$.subscribe((external: SubCoFcIntExt[]) =>{
          this.internalExternal = external;
          this.getTotals();
        })
        break;
      case 'offshore':
        this.subcoFinancialControllerService.offshoreSubCo$.subscribe((offshore: SubCoFcOffshore) =>{
          this.offshoreTotals = offshore;
        })
        break;
      default:
      case 'internal':
        this.subcoFinancialControllerService.initSubCoInternalForMonth(this.month.id);

        this.subcoFinancialControllerService.intExtSubCo$.subscribe((internalSubco: SubCoFcIntExt[]) =>{
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

  /**
   * 
   */
  ngOnDestroy(): void {
  }

  exportCSV(): void {
    this.pageState.showSpinner();

    switch(this.filter){
      case 'external': {
        let lineEnding = "\r\n";
        let header: string = "Month;" + this.month.name + lineEnding
          + "Working Days;" + this.month.workingdays + lineEnding
          + "Resource Name;Project Name;Customer;Revenue;Cost;Contribution;CP"
          + lineEnding;
        
        let body = "";
    
        let totalRevenue =0;
        let totalCost =0;
        let totalContribution =0;
        let totalCP =0;

        
        this.subcoFinancialControllerService.intExtSubCo$.subscribe((external: SubCoFcIntExt[]) =>{
          this.internalExternal = external;
          this.getTotals();
        })
        

        this.internalExternal.forEach((subco: any) => {
      
          let line = subco.resourceName+ ";" 
            + subco.projectName +";"
            + subco.customer+";"  
            + this.numberToString(subco.revenue)+";"    
            + this.numberToString(subco.cost)+";" 
            + this.numberToString(subco.contribution)+";"       
            + this.numberToString(subco.cp,2)+";"         
            + lineEnding;
          body = body + line;
          totalRevenue += subco.revenue;
          totalCost += subco.cost;
          totalContribution += subco.contribution;
          totalCP += subco.cp;
        });
         
          let summaryHeader = "Summary;" + this.month.name + lineEnding
          + "Revenue;Cost;Contribution;CP" 
          + lineEnding;
         let summaryLine = this.numberToString(totalRevenue) + ";" 
          + this.numberToString(totalCost) + ";" 
          + this.numberToString(totalContribution) + ";" 
          + this.numberToString(totalCP) + ";"        
          + lineEnding;
          

          const data = header + body + lineEnding + lineEnding + summaryHeader + summaryLine;
          const blob: Blob = new Blob([data], { type: "text/csv" });
          const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SubcoExternalOverview.csv";    
      
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
       
     
       break;
      }
      case 'offshore':{   
          let lineEndingOffshore = "\r\n";
          let headerOffshore: string = "Month;" + this.month.name + lineEndingOffshore
            + "Working Days;" + this.month.workingdays + lineEndingOffshore
            + "Revenue;Cost;Contribution;CP"
            + lineEndingOffshore;
          
          let bodyOffshore = "";
              
          this.subcoFinancialControllerService.offshoreSubCo$.subscribe((offshore: SubCoFcOffshore) =>{
            this.offshoreTotals = offshore;
          })
          
        
            let line = this.offshoreTotals.totalRevenue + ";" 
            + this.offshoreTotals.totalCost+ ";"
            + this.offshoreTotals.totalContribution+ ";" 
            + this.offshoreTotals.totalCp +";"
            +lineEndingOffshore;

            bodyOffshore = bodyOffshore + line;

            const data = headerOffshore + bodyOffshore + lineEndingOffshore + lineEndingOffshore;
            const blob: Blob = new Blob([data], { type: "text/csv" });
            const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SubcoOffshoreOverview.csv";    
        
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
          ;
        break;
      }
      default:
      case 'internal':{
        let lineEndingInternal = "\r\n";
        let headerInternal: string = "Month;" + this.month.name + lineEndingInternal
          + "Working Days;" + this.month.workingdays + lineEndingInternal
          + "Resource Name;Project Name;Customer;Eastern Europe(?);Revenue;Cost;Contribution;CP"
          + lineEndingInternal;
        
        let bodyInternal = "";
    
        let totalRevenueInternal =0;
        let totalCostInternal =0;
        let totalContributionInternal =0;
        let totalCPInternal =0;

        
        this.subcoFinancialControllerService.intExtSubCo$.subscribe((internal: SubCoFcIntExt[]) =>{
          this.internalExternal = internal;
          this.getTotals();
        })
        

        this.internalExternal.forEach((subco: any) => {
      
          let line = subco.resourceName+ ";" 
            + subco.projectName +";"
            + subco.customer+";"  
            + subco.isEasternEurope+";"
            + this.numberToString(subco.revenue)+";"    
            + this.numberToString(subco.cost)+";" 
            + this.numberToString(subco.contribution)+";"       
            + this.numberToString(subco.cp,2)+";"         
            + lineEndingInternal;
          bodyInternal = bodyInternal + line;
          totalRevenueInternal += subco.revenue;
          totalCostInternal += subco.cost;
          totalContributionInternal += subco.contribution;
          totalCPInternal += subco.cp;
        });

          let summaryHeader = "Summary;" + this.month.name + lineEndingInternal
          + "Revenue;Cost;Contribution;CP" 
          + lineEndingInternal;
          let summaryLine = this.numberToString(totalRevenueInternal) + ";" 
          + this.numberToString(totalCostInternal) + ";" 
          + this.numberToString(totalContributionInternal) + ";" 
          + this.numberToString(totalCPInternal) + ";"        
          + lineEndingInternal;

          const data = headerInternal + bodyInternal + lineEndingInternal + lineEndingInternal + summaryHeader + summaryLine;
          const blob: Blob = new Blob([data], { type: "text/csv" });
          const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SubcoInternalOverview.csv";    
      
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
       
        
        break;
      }
    }
  }

  numberToString(no: number, precision: number = 2): string {
    return no.toLocaleString("de",  { minimumFractionDigits: 0, maximumFractionDigits: precision } ).replace(".","");
  }

  getTotals(){
    let revenue = 0;
    let cost = 0;
    let contribution = 0;
    this.internalExternal.forEach((ie: SubCoFcIntExt) =>{
      revenue += ie.revenue;
      cost += ie.cost;
      contribution += ie.contribution;
    })
    this.totals = { 
      revenue: revenue, 
      cost: cost, 
      contribution: contribution,
      cp: contribution / revenue
    };
  }
}
