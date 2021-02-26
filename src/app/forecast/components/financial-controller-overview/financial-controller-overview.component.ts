import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { Month } from "../../../core/interfaces/month";
import { FinancialControllerSummaryAPPS } from "../../../core/interfaces/financialAppsSummary";
import { DatePipe } from "@angular/common";

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

  @Input("financial") financialData: FinancialControllerSummaryAPPS[];

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
    }
  }

  mapKpiToUnit(name: string): string {
    switch (name) {
      case "arve":
        return "%";
      case "arvi":
        return "%";
      case "expectedRevenue":
        return "€";
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


  mapKpiToValue(name: string, monthId: number): number {
    let entry = this.financialData.find((value: FinancialControllerSummaryAPPS) => value.monthId == monthId);

    if (entry === undefined) {
      return undefined;
    }

    switch (name) {
      case "arve":
        return entry.arve * 100;
      case "arvi":
        return entry.arvi * 100;
      case "expectedRevenue":
        return entry.expectedRevenue;
      case "cor":
        return entry.cor;
      case "btu":
        return entry.btu;
      case "avgVacation":
        return entry.avgVacation;
      case "ftecss":
        return entry.fteCSS;
      case "pror":
        return entry.pror;
      case "ROS":
        return entry.ROS;
      case "ROSint":
        return entry.ROSint;
      case "ROSext":
        return entry.ROSext;
      case "urve":
        return entry.urve * 100;
      case "urvi":
        return entry.urvi * 100;
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