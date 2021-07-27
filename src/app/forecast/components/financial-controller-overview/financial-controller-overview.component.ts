import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { Month } from "../../../core/interfaces/month";
import { FinancialControllerSummaryAPPS } from "../../../core/interfaces/financialAppsSummary";
import { DatePipe } from "@angular/common";
import { ProbabilitySummary } from "../../../core/interfaces/probabilitySummary";

@Component({
  selector: 'app-financial-controller-overview',
  templateUrl: './financial-controller-overview.component.html',
  styleUrls: ['./financial-controller-overview.component.scss'],
})
export class FinancialControllerOverviewComponent implements OnInit, OnDestroy {

  kpis: string[] = [
    "ROS",
    "ROSint",
    "ROSext",
    "avgVacation",
    "ftecss",
    "urve",
    "arve",
    "cor",
    "btu",
    "pror",
    "arvi",
    "urvi",
    "expectedRevenue",
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
    console.log(this.columnsToDisplay);
    console.log(this.columnsToDisplay2);
    console.log(this.columnsToDisplay.pop);
  }

  showToggle(name: any) : boolean{
    if(name === 'ftecss' || name === 'avgVacation'){
      return false;
    }
    return true;
  }

  openPanel(name: any): boolean {
    if(name !== 'ftecss' && name !== 'avgVacation'){
      return false;
    }
    return true;
  }

  disable(name: any): boolean {
    if(name === 'ftecss' || name === 'avgVacation'){
      return false;
    }
    return true;
  }

  mapKpiToUnit(name: string): string {
    switch (name) {
      case "arve":
        return "%";
      case "arvi":
        return "%";
      case "expectedRevenue":
        return "€";
      case "avgVacation":
        return "Days";
      case "cor":
        return "€";
      case "btu":
        return "";
      case "avgVacation":
        return "Days";
      case "ftecss":
        return "FTE";
      case "pror":
        return "%";
      case "ROS":
        return "€";
      case "ROSint":
        return "€";
      case "ROSext":
        return "€";
      case "urve":
        return "%";
      case "urvi":
        return "%";
      default:
        return undefined;
    }
  }

  
  getGradeNumberFromGrade(grade:string) : number{
    switch(grade){
      case 'A':
        return 1;
      case 'B':
        return 2;
      case 'C':
        return 3;
      case 'D':
        return 4;
      case 'E':
        return 5;
      case 'F':
        return 6;
    }
  }

  mapGradeToValue(grade: string, monthId: number, kpi:string): number {
    if(kpi === "avgVacation")
      return this.probabilitySummaries.get(monthId).avgVacationDaysPerGrade.get(this.getGradeNumberFromGrade(grade)).average;
    if(kpi === "ftecss")
      return this.probabilitySummaries.get(monthId).avgFTEPerGrade.get(this.getGradeNumberFromGrade(grade)).count;
    return 0;
  }


  mapKpiToValue(name: string, monthId: number): number {
    let entry = this.financialData.find((value: FinancialControllerSummaryAPPS) => value.monthId == monthId);

    if (entry === undefined || this.probabilitySummaries.get(monthId) === undefined) {
      return undefined;
    }
    switch (name) {
      case "arve":
        return this.probabilitySummaries.get(monthId).arve * 100;
      case "arvi":
        //might needs to be multiplyed by 100
        return -1;
      case "expectedRevenue":
        return -1;
      case "cor":
        return this.probabilitySummaries.get(monthId).cor;
      case "btu":
        return -1;
      case "avgVacation":
        return -1;
      case "ftecss":
        return -1;
      case "pror":
        return -1;
      case "ROS":
        return this.probabilitySummaries.get(monthId).revenue;
      case "ROSint":
        return this.probabilitySummaries.get(monthId).internalRevenue;
      case "ROSext":
        return this.probabilitySummaries.get(monthId).externalRevenue;
      case "urve":
        return this.probabilitySummaries.get(monthId).urve *100;
      case "urvi":
        //might needs to be multiplyed by 100
        return -1;
      default:
        return undefined;
    }
  }

  mapKpiToName(name: string): string {
    switch (name) {
      case "arve":
        return "ARVE";
      case "arvi":
        return "ARVI";
      case "expectedRevenue":
        return "Expected Revenue";
      case "cor":
        return "COR";
      case "btu":
        return "BTU";
      case "avgVacation":
        return "Average Vacation Days";
      case "ftecss":
        return "FTE";
      case "pror":
        return "PROR";
      case "ROS":
        return "ROS";
      case "ROSint":
        return "ROS internal";
      case "ROSext":
        return "ROS external";
      case "urve":
        return "URVE";
      case "urvi":
        return "URVI";
      default:
        return undefined;
    }
  }
  exportCSV(): void {
    const header = "KPI;" + this.months.map((month: Month) => { return month.name }).join(";") + "\r\n";
    const rows = this.kpis.map((kpi: string) => {
      return this.mapKpiToName(kpi) + ";" + this.months.map((month: Month) => {
        return this.mapKpiToValue(kpi, month.id).toString().replace(".",",");
      }).join(";");
    }).join("\r\n");

    const data = header + rows;

    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-KPISummary.csv";

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
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

  ngOnDestroy(): void {
  }
}