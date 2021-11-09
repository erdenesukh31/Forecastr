import { Component, Input, OnInit, Inject } from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ExecutiveForecastsService } from "../../../core/services/forecasts/executive-forecasts.service";
import { MonthlySummaryReport } from "../../../core/interfaces/kpiData";
import { PageStateService } from "../../../core/shared/page-state.service";
import { DatePipe } from '@angular/common';
import { Subscription } from "rxjs";

import { SubCoTotals } from "../../../core/interfaces/subCoTotals";
import { SubCoDetailTotals } from "../../../core/interfaces/subCoDetailTotals";
import { SubCoService } from "../../../core/services/subCo.service";
import { Month } from "../../../core/interfaces/month";
import { UtilitiesService } from "../../../core/services/utilities.service";


@Component({
  selector: "app-subco-executive-chart",
  templateUrl: "./subco-executive-chart.component.html",
  styleUrls: ["./subco-executive-chart.component.scss"]
})
export class SubcoExecutiveChartComponent implements OnInit {

  /**
   * month (received as input)
   */
   @Input('month') month: Month;
   @Input('months') months: Month[];
  showComponent: boolean = false;
  
  subCoDetailTotals: SubCoDetailTotals[];   
  monthLabels: string[];

  totalRevenueInternal: number[];
  totalRevenueExternal: number[];
  totalRevenueOffshore: number[];
  totalCostInternal: number[];
  totalCostExternal: number[];
  totalCostOffshore: number[];
  averageFTEInternal: number[];
  averageFTEExternal: number[];
  averageFTEOffshore: number[];
  totalCPInternal: number[];
  totalCPExternal: number[];
  totalCPOffshore: number[];
  
  totalsSubscription: Subscription;


  constructor(
    public dialogRef: MatDialogRef<SubcoExecutiveChartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private subcoService: SubCoService,
    private pageState: PageStateService,
    private datePipe: DatePipe,
    private utilitiesService: UtilitiesService,

  ) {  
    this.totalRevenueInternal = [];
    this.totalRevenueExternal = [];
    this.totalRevenueOffshore= [];
    this.totalCostInternal= [];
    this.totalCostExternal= [];
    this.totalCostOffshore= [];
    this.averageFTEInternal= [];
    this.averageFTEExternal= [];
    this.averageFTEOffshore= [];
    this.monthLabels = [];
    this.totalCPInternal = [];
    this.totalCPExternal = [];
    this.totalCPOffshore = [];

  }

  ngOnInit() {

    
    this.months = this.utilitiesService.getMonths();
    const dateObj = new Date();
    const monthName = dateObj.toLocaleString("default", { month: "short" });
    var year = dateObj.getFullYear();
    var last = String(year).slice(-2);
    var monthYear = monthName + " '"+last;
    var i = 0;
    for (i = 0; i < this.months.length; i++) {
      if(this.months[i].name.includes(monthYear))
      {
        break;
      }
    }
    
    this.subcoService.initializeSubcoDetailTotalsForMonthRange(i+2,i+7);


    this.totalsSubscription = this.subcoService.subCoDetailTotals$
    .subscribe((subcoDetailTotals: SubCoDetailTotals[]) => {
      this.subCoDetailTotals = subcoDetailTotals;
      this.subCoDetailTotals = this.subCoDetailTotals.sort(function(a, b) { return a.monthId-b.monthId });
      if (this.subCoDetailTotals.length > 0) {
       this.processTableData(this.subCoDetailTotals);
     this.showComponent = true;    
     }
    });
  }

  processTableData(totals: SubCoDetailTotals[]) : void {
    const dateObj = new Date();
    const monthName = dateObj.toLocaleString("default", { month: "short" });
    var year = dateObj.getFullYear();
    var last = String(year).slice(-2);
    var monthYear = monthName + " '"+last;
    var i = 0;
    for (i = 0; i < this.months.length; i++) {
      if(this.months[i].name.includes(monthYear))
      {
        break;
      }
    }
    
    i=i+1;

    this.totalRevenueInternal = [];
    this.totalRevenueExternal = [];
    this.totalRevenueOffshore= [];
    this.totalCostInternal= [];
    this.totalCostExternal= [];
    this.totalCostOffshore= [];
    this.averageFTEInternal= [];
    this.averageFTEExternal= [];
    this.averageFTEOffshore= [];
    this.totalCPInternal = [];
    this.totalCPExternal = [];
    this.totalCPOffshore = [];
    this.monthLabels = [];

    for (let total of totals) {
    
      this.totalRevenueInternal.push(total.subcontractorTotals.totalRevenueInternal);
      this.totalRevenueExternal.push(total.subcontractorTotals.totalRevenueExternal);
      this.totalRevenueOffshore.push(total.subcontractorTotals.totalRevenueOffshore);
      this.totalCostInternal.push(total.subcontractorTotals.totalCostInternal);
      this.totalCostExternal.push(total.subcontractorTotals.totalCostExternal);
      this.totalCostOffshore.push(total.subcontractorTotals.totalCostOffshore);
      this.averageFTEInternal.push(total.subcontractorTotals.averageFTEInternal);
      this.averageFTEExternal.push(total.subcontractorTotals.averageFTEExternal);
      this.averageFTEOffshore.push(total.subcontractorTotals.averageFTEOffshore);
      this.totalCPInternal.push(total.subcontractorTotals.totalCPInternal * 100);
      this.totalCPExternal.push(total.subcontractorTotals.totalCPExternal* 100);
      this.totalCPOffshore.push(total.subcontractorTotals.totalCPOffshore* 100);

      this.monthLabels.push(this.months[i].name);  
      i++;
    }


  }

  ngOnDestroy(): void {
    this.totalsSubscription.unsubscribe();
  }

  total(numArray: number[]) {
    return numArray.reduce(function(a, b) {
      return a + b;
    }, 0);
  }

  average(numArray: number[]) : number {
    return this.total(numArray) / numArray.length;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  exportCSV(): void {
    this.pageState.showSpinner();
    let lineEnding = "\r\n";
    let header = "KPI;" + this.monthLabels.join(";") + lineEnding;
    let body: string = 
      "Total Int. Revenue;" + this.totalRevenueInternal.map(this.numberToString).join(";") + lineEnding + 
      "Total Ext. Revenue;" + this.totalRevenueExternal.map(this.numberToString).join(";") + lineEnding +
      "Total Off. Revenue;" + this.totalRevenueOffshore.map(this.numberToString).join(";") + lineEnding +
      "Total Int. Cost;" + this.totalCostInternal.map(this.numberToString).join(";") + lineEnding +
      "Total Ext. Cost;" + this.totalCostExternal.map(this.numberToString).join(";") + lineEnding + 
      "Total Off. Cost;" + this.totalCostOffshore.map(this.numberToString).join(";") + lineEnding +
      "Avg. Int. FTE;" + this.averageFTEInternal.map(this.numberToString).join(";") + lineEnding +
      "Avg. Ext. FTE;" + this.averageFTEExternal.map(this.numberToString).join(";") + lineEnding +
      "Avg. Off. FTE;" + this.averageFTEOffshore.map(this.numberToString).join(";") + lineEnding +
      "Total Int. CP;" + this.totalCPInternal.map(this.numberToString).join(";") + lineEnding +
      "Total Ext. CP;" + this.totalCPExternal.map(this.numberToString).join(";") + lineEnding +
      "TOtal Off. CP;" + this.totalCPOffshore.map(this.numberToString).join(";") + lineEnding;
    const data = header + body;
    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SubCoKPIOverview.csv";    
    this.pageState.hideSpinner();

    //For IE
    let navigator: any = window.navigator;
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

  numberToString(no: number): string {
    return no.toLocaleString("de",  { minimumFractionDigits: 0, maximumFractionDigits: 2 } ).replace(".","");
  }
}
