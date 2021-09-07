import { Component, Input, OnInit, Inject } from "@angular/core";
import { Chart } from "chart.js";
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ExecutiveForecastsService } from "../../../core/services/forecasts/executive-forecasts.service";
import { MonthlySummaryReport } from "../../../core/interfaces/kpiData";
import { PageStateService } from "../../../core/shared/page-state.service";
import { DatePipe } from '@angular/common';

@Component({
  selector: "app-executive-chart",
  templateUrl: "./executive-chart.component.html",
  styleUrls: ["./executive-chart.component.scss"]
})
export class ExecutiveChartComponent implements OnInit {

  showComponent: boolean = false;
  
  summaryValuesArray: SummaryValues[];
  
  reports: MonthlySummaryReport[];

  monthLabels: string[];

  /*
   *ChartJs object which will render the ARVE/URVE chart
   */
  arveUrveChart;
  /*
   * ARVE set for total ARVE/month for the next 6 months
   */
  arve: number[];
  /*
   * URVE set for total URVE/month for the next 6 months
   */
  urve: number[];

  /*
   *ChartJs object which will render the COR chart
   */
  corChart;
  /*
   * COR set for total COR/month for the next 6 months
   */
  cor: number[];

  /*
   *ChartJs object which will render the Revenue chart
   */
  revenueChart;
  /*
   * Internal revenue set for internal revenue/month for the next 6 months
   */
  intRev: number[];
  /*
   * External revenue set for external revenue/month for the next 6 months
   */
  extRev: number[];
  /*
   * Total revenue set for total revenue/month for the next 6 months
   */
  totalRev: number[];

  fte: number[];

  constructor(
    public dialogRef: MatDialogRef<ExecutiveChartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private executiveService: ExecutiveForecastsService,
    private pageState: PageStateService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.reports = this.executiveService.getKpiData();
    this.reports = this.reports.sort(function(a, b) { return a.monthId-b.monthId });
    
    /**initialize arve to empty set */
    this.arve = [];
    
    /**initialize urve to empty set */
    this.urve = [];
    
    /**initialize cor to empty set */
    this.cor = [];
    
    /**initialize extRev to empty set */
    this.extRev = [];
    
    /**initialize intRev to empty set */
    this.intRev = [];
    
    /**initialize totalRev to empty set */
    this.totalRev = [];

    this.monthLabels = [];

    this.fte = [];

    if (this.reports.length > 0) {
      this.processTableData(this.reports);
      this.showComponent = true;    
    }   
  }

  processTableData(reports: MonthlySummaryReport[]) : void {
    for (let report of reports) {
      this.arve.push(report.arve * 100);
      this.urve.push(report.urve * 100);
      this.cor.push(report.cor);
      this.intRev.push(report.internalRevenue);
      this.fte.push(report.fte);
      this.extRev.push(report.externalRevenue);
      this.totalRev.push(report.ros);
      this.monthLabels.push(report.month.charAt(0).toUpperCase() + report.month.slice(1) + ' \'' + (report.year % 100).toString());
    }

    this.arveUrveChart = new Chart("arve-urve", {
      type: "bar",
      data: {
        labels: this.monthLabels,
        datasets: [
          {
            label: "ARVE",
            backgroundColor: "#95E616",
            data: this.arve
          },
          {
            label: "URVE",
            backgroundColor: "#FF304C",
            data: this.urve
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5
            }
          ],
          yAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              ticks: {
                min: 0,
                max: 100
              }
            }
          ]
        }
      }
    });

    this.corChart = new Chart("cor", {
      type: "line",
      data: {
        labels: this.monthLabels,
        datasets: [
          {
            data: this.cor,
            borderColor: "#7e39ba",
            fill: false
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.5,
              categoryPercentage: 0.5
            }
          ],
          yAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              ticks: {
                min: 0
              }
            }
          ]
        }
      }
    });

    this.revenueChart = this.arveUrveChart = new Chart("revenue", {
      type: "bar",
      data: {
        labels: this.monthLabels,
        datasets: [
          {
            label: "INT",
            backgroundColor: "#12abdb",
            data: this.intRev
          },
          {
            label: "EXT",
            backgroundColor: "#0070ad",
            data: this.extRev
          },
          {
            label: "TOTAL",
            backgroundColor: "#2b0a3d",
            data: this.totalRev
          }
        ]
      },
      options: {
        legend: {
          display: true
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5
            }
          ],
          yAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              ticks: {
                min: 0
              }
            }
          ]
        }
      }
    });
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
    let body: string = "ARVE;" + this.arve.map(this.numberToString).join(";") + lineEnding + 
      "URVE;" + this.urve.map(this.numberToString).join(";") + lineEnding +
      "COR;" + this.cor.map(this.numberToString).join(";") + lineEnding +
      "Int. Revenue;" + this.intRev.map(this.numberToString).join(";") + lineEnding + 
      "Ext. Revenue;" + this.extRev.map(this.numberToString).join(";") + lineEnding +
      "Total Revenue;" + this.totalRev.map(this.numberToString).join(";") + lineEnding +
      "FTE;" + this.fte.map(this.numberToString).join(";") + lineEnding;
    const data = header + body;
    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-KPIOverview.csv";    
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
    return no.toLocaleString("de",  { minimumFractionDigits: 2 } ).replace(".","");
  }
}

export interface SummaryValues {
  monthId: number;
  probabilityId: number;
  billableDays: number;
  nonBillableDays: number;
  vacationDays: number;
  trainingDays: number;
  businessDays: number;
  benchDays: number;
  workingDays: number;
  fteCss: number;
  cor: number;
  arve: number;
  fte: number;
  urve: number;
  ros: number;
  external: number;
}
