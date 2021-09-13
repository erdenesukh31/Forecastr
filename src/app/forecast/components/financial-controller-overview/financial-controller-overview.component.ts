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

  grades: string[] = [
    "S",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
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
        return "";
      case "expectedRevenue":
        return "";
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
        return "";
      default:
        return undefined;
    }
  }

  
  getGradeNumberFromGrade(grade:string) : number{
    switch(grade){
      case 'S':
        return 1;
      case 'A':
        return 2;
      case 'B':
        return 3;
      case 'C':
        return 4;
      case 'D':
        return 5;
      case 'E':
        return 6;
      case 'F':
        return 7;
    }
  }

  mapGradeToValue(grade: string, monthId: number, kpi:string): number {
    if(!this.probabilitySummaries.has(monthId))
    { 
      return 0;
    }
    let gradeNumber = this.getGradeNumberFromGrade(grade);

    if(kpi === "avgVacation"){
      if(!this.probabilitySummaries.get(monthId).avgVacationDaysPerGrade.has(gradeNumber))
      {
        return 0;
      }
      return this.probabilitySummaries.get(monthId).avgVacationDaysPerGrade.get(gradeNumber).average;
    }
   
    if(kpi === "ftecss")
    {
      if(!this.probabilitySummaries.get(monthId).avgFTEPerGrade.has(gradeNumber))
      {
        return 0;
      }
      return this.probabilitySummaries.get(monthId).avgFTEPerGrade.get(gradeNumber).average;
    }
    
    return 0;
  }


  mapKpiToValue(name: string, monthId: number): number {
    let entry = this.financialData.find((value: FinancialControllerSummaryAPPS) => value.monthId == monthId);

    if (entry === undefined || !this.probabilitySummaries.has(monthId)) {
      return 0;
    }
    switch (name) {
      case "arve":
        return  this.probabilitySummaries.get(monthId).arve * 100;
      case "arvi":
        return entry.arvi;
      case "expectedRevenue":
        return entry.expectedRevenue;
      case "cor":
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