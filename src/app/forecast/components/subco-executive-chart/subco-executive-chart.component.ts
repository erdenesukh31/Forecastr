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
  
  SubCoDetailTotals: SubCoDetailTotals[];   
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
  
  totalsSubscription: Subscription;


  constructor(
    public dialogRef: MatDialogRef<SubcoExecutiveChartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private subcoService: SubCoService,
    private pageState: PageStateService,
    private datePipe: DatePipe,
    private utilitiesService: UtilitiesService,
  ) {}

  ngOnInit() {
    debugger;
    this.months = this.utilitiesService.getMonths();
    this.subcoService.initializeSubcoDetailTotalsForMonthRange(this.month.id,(this.month.id+5));

    this.totalsSubscription = this.subcoService.subCoDetailTotals$
    .subscribe((subcoDetailTotals: SubCoDetailTotals[]) => {
      this.SubCoDetailTotals = subcoDetailTotals;
    }); 

    this.SubCoDetailTotals = this.SubCoDetailTotals.sort(function(a, b) { return a.monthId-b.monthId });
    //if?
    this.processTableData(this.SubCoDetailTotals);
    this.showComponent = true;    

  }

  processTableData(totals: SubCoDetailTotals[]) : void {
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
      //needed?
     // this.monthLabels.push(total.month.charAt(0).toUpperCase() + total.month.slice(1) + ' \'' + (total.year % 100).toString());
    }

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
    let body: string = "Total Int. Revenue;" + this.totalCostInternal.map(this.numberToString).join(";") + lineEnding + 
      "Total Ext. Revenue;" + this.totalRevenueExternal.map(this.numberToString).join(";") + lineEnding +
      "Total Off. Revenue;" + this.totalCostOffshore.map(this.numberToString).join(";") + lineEnding +
      "Total Int. Cost;" + this.totalCostInternal.map(this.numberToString).join(";") + lineEnding +
      "Total Ext. Cost;" + this.totalCostExternal.map(this.numberToString).join(";") + lineEnding + 
      "Total Off. Cost;" + this.totalCostOffshore.map(this.numberToString).join(";") + lineEnding +
      "Avg. Int. FTE" + this.averageFTEInternal.map(this.numberToString).join(";") + lineEnding +
      "Avg. Ext. FTE;" + this.averageFTEExternal.map(this.numberToString).join(";") + lineEnding;
      "Avg. Off. FTE;" + this.averageFTEOffshore.map(this.numberToString).join(";") + lineEnding;
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
