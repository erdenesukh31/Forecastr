import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { Month } from "../../../core/interfaces/month";
import { FinancialControllerSummaryAPPS } from "../../../core/interfaces/financialAppsSummary";
import { DatePipe } from "@angular/common";
import { ProbabilitySummary } from "../../../core/interfaces/probabilitySummary";

@Component({
  selector: 'app-subco-fc-offshore',
  templateUrl: './subco-fc-offshore.component.html',
  styleUrls: ['./subco-fc-offshore.component.scss'],
})
export class SubCoFcOffshoreComponent implements OnInit, OnDestroy {

    kpis: string[] = [
        "TotalRevenue",
        "TotalCost",
        "TotalContribution",
        "TotalCP%"    
      ];
  @Input('months') months: Month[];

  /**
    * columns which are displaye
   */
  columnsToDisplay: String[] = [];
  columnsToDisplay2: String[] = [];

  
    @Input("financial") financialData: FinancialControllerSummaryAPPS[];
    @Input("probabilitySummaries") probabilitySummaries: Map<number,ProbabilitySummary>;
  

  constructor(
    private datePipe: DatePipe,
  ) {
  }

  ngOnInit(): void {
    this.initFinancialData();
  }

  initFinancialData(): void {
    this.columnsToDisplay.push('kpi');
    for (let month of this.months) {
      this.columnsToDisplay.push(month.name);
      this.columnsToDisplay2.push(month.name);
     
    }
  }

  mapKpiToUnit(name: string): string {
    switch (name) {
      case "TotalRevenue":
        return "€";
      case "TotalCost":
        return "€";
      case "TotalContribution":
        return "Days";
      case "TotalCP%":
        return "%";
      default:
        return undefined;
    }
  }

 

  mapKpiToName(name: string): string {
    switch (name) {
      case "TotalRevenue":
        return "Total Revenue";
      case "TotalCost":
        return "Total Cost";
      case "TotalContribution":
        return "Total Contribution";
      case "TotalCP%":
        return "Total CP %";
      default:
        return undefined;
    }
  }

   // WIP
   mapKpiToValue(name: string, monthId: number): number {
    let entry = this.financialData.find((value: FinancialControllerSummaryAPPS) => value.monthId == monthId);

    if (entry === undefined || !this.probabilitySummaries.has(monthId)) {
      return 0;
    }
    switch (name) {
      case "TotalRevenue":
        return  this.probabilitySummaries.get(monthId).arve * 100;
      case "TotalCost":
        return entry.arvi;
      case "TotalContribution":
        return entry.expectedRevenue;
      case "TotalCP%":
        return this.probabilitySummaries.get(monthId).cor;
      case "btu":
        return entry.btu;
      case "avgVacation":
        return entry.avgVacation;
      case "ftecss":
        return entry.fte;
      case "pror":
        return entry.pror;
      case "ROS":
        return this.probabilitySummaries.get(monthId).revenue;
      case "ROSint":
        return this.probabilitySummaries.get(monthId).internalRevenue;
      case "ROSext":
        return this.probabilitySummaries.get(monthId).externalRevenue;
      case "urve":
        return this.probabilitySummaries.get(monthId).urve *100;
      case "urvi":
        return entry.urvi;
      default:
        return undefined;
    }
  }
  exportCSV(): void {
    const header = "KPI;" + this.months.map((month: Month) => { return month.name }).join(";") + "\r\n";
    const rows = this.kpis.map((kpi: string) => {
      return this.mapKpiToName(kpi) + ";" + this.months.map((month: Month) => {
        return this.numberToString(this.mapKpiToValue(kpi, month.id));
      }).join(";");
    }).join("\r\n");

    const data = header + rows;

    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-KPISummary.csv";

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
  numberToString(no: number): string {
    return no.toLocaleString("de",  { minimumFractionDigits: 0, maximumFractionDigits: 2 } ).replace(".","");
  }
  ngOnDestroy(): void {
  }
}