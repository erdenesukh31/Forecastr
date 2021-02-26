import { Component, Input, OnInit, ElementRef } from "@angular/core";
import { Chart } from "chart.js";
import { Month } from "../../../core/interfaces/month";
import { ExecutiveForecastsService } from '../../../core/services/forecasts/executive-forecasts.service';
import { GraphicSummaryReport, GraphicSummaryProbabilityEntry, GraphicSummaryProjectTypeEntry } from '../../../core/interfaces/graphicData';
@Component({
  selector: "app-executive-stats",
  templateUrl: "./executive-stats.component.html",
  styleUrls: ["./executive-stats.component.scss"]
})
export class ExecutiveStatsComponent implements OnInit {
  @Input() months: Month[];

  graphicData: GraphicSummaryReport[];

  arve: number[];

  urve: number[];

  externalRevenue: number[];

  ros: number[];

  teamLabels: string[];

  workingDays: number[];

  namedLikelyDays: number[];

  firmDays: number[];

  unnamedDays: number[];
  
  nonBillableDays: number[];

  billableDays: number[];

  cor: number[];

  internalRevenue: number[];

  selectedIndex: Number = 0;
  /*
   *ChartJs object which will render the Teams chart
   */
  daysChart;
  probabilitiesChart;
  arveUrveChart;
  corChart;
  revenueChart;

  constructor(
    private elementRef: ElementRef,
    private executiveService: ExecutiveForecastsService
  ) {}

  ngOnInit() {
    this.executiveService.graphicData$.subscribe((reports: GraphicSummaryReport[]) => {
      this.graphicData = reports;
      this.arve = [];
      this.urve = [];
      this.externalRevenue = [];
      this.ros = [];
      this.teamLabels = [];
      this.workingDays = [];
      this.namedLikelyDays = [];
      this.firmDays = [];
      this.unnamedDays = [];
      this.nonBillableDays = [];
      this.billableDays = [];
      this.cor = [];
      this.internalRevenue = [];

      for (let report of reports) {
        this.arve.push(report.arve * 100);
        this.urve.push(report.urve * 100);
        this.externalRevenue.push(report.externalRevenue);
        this.ros.push(report.ros);
        this.teamLabels.push(report.team);
        this.workingDays.push(report.workingDays);

        for(let entry of report.probabilities) {
          if(entry.probability === 'Firm') {
            this.firmDays.push(entry.days);
          } else if(entry.probability === 'Named Likely') {
            this.namedLikelyDays.push(entry.days);
          } else if(entry.probability === "Unnamed") {
            this.unnamedDays.push(entry.days);
          }
        }

        for(let entry of report.projectTypes) {
          if(entry.projectType === "Non Billable") {
            this.nonBillableDays.push(entry.days);
          } else if(entry.projectType === "Billable") {
            this.billableDays.push(entry.days);
          }
        }

        this.cor.push(report.cor);
        this.internalRevenue.push(report.ros - report.externalRevenue);
      }

      this.initCharts();
    });
  }

  initCharts() {
    let daysChartCanvas = this.elementRef.nativeElement.querySelector(
      `#daysChart`
    );
    let daysChartRef = daysChartCanvas.getContext("2d");
    this.daysChart = new Chart(daysChartRef, {
      type: "bar",
      data: {
        labels: this.teamLabels,
        datasets: [
          {
            label: "Working Days",
            backgroundColor: "#0ba7fb",
            data: this.workingDays
          },
          {
            label: "Billable Days",
            backgroundColor: "#0070ad",
            data: this.billableDays
          },
          {
            label: "Non-Billable Days",
            backgroundColor: "#004569",
            data: this.nonBillableDays
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: "top"
        },
        title:{
          display: true,
          text: "Amount of Days grouped by Type",
          fontSize: 18
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5,
              scaleLabel:  {
                display: true,
                labelString: "Teams/Practices",
                fontSize: 18
              }
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
              },
              scaleLabel:  {
                display: true,
                labelString: "Amount of Days",
                fontSize: 18
              }
            }
          ]
        }
      }
    });

    let probabilitiesChartCanvas = this.elementRef.nativeElement.querySelector(
      `#probabilitiesChart`
    );
    let probabilitiesChartRef = probabilitiesChartCanvas.getContext("2d");
    this.probabilitiesChart = new Chart(probabilitiesChartRef, {
      type: "bar",
      data: {
        labels: this.teamLabels,
        datasets: [
          {
            label: "Firm",
            backgroundColor: "#0ba7fb",
            data: this.firmDays
          },
          {
            label: "Unnamed",
            backgroundColor: "#0070ad",
            data: this.unnamedDays
          },
          {
            label: "Named Likely",
            backgroundColor: "#004569",
            data: this.namedLikelyDays
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: "top"
        },
        title:{
          display: true,
          text: "Amount of forecasted days by Teams grouped by Probability",
          fontSize: 18
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5,
              scaleLabel:  {
                display: true,
                labelString: "Teams/Practices",
                fontSize: 18
              }
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
              },
              scaleLabel: {
                display: true,
                labelString: "Amount of Days",
                fontSize: 18
              }
            }
          ]
        }
      }
    });

    let arveUrveChartCanvas = this.elementRef.nativeElement.querySelector(
      `#arveUrveChart`
    );
    let arveUrveChartRef = arveUrveChartCanvas.getContext("2d");
    this.arveUrveChart = new Chart(arveUrveChartRef, {
      type: "bar",
      data: {
        labels: this.teamLabels,
        datasets: [
          {
            label: "ARVE",
            backgroundColor: "#0ba7fb",
            data: this.arve
          },
          {
            label: "URVE",
            backgroundColor: "#004569",
            data: this.urve
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: "top"
        },
        title:{
          display: true,
          text: "ARVE/URVE Average for Teams during Period in %",
          fontSize: 18
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5,
              scaleLabel:  {
                display: true,
                labelString: "Teams/Practices",
                fontSize: 18
              }
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
              },
              scaleLabel: {
                display: true,
                labelString: "ARVE/URVE Average in %",
                fontSize: 18
              }
            }
          ]
        }
      }
    });

    let revenueChartCanvas = this.elementRef.nativeElement.querySelector(
      `#revenueChart`
    );
    let revenueChartRef = revenueChartCanvas.getContext("2d");
    this.revenueChart = new Chart(revenueChartRef, {
      type: "bar",
      data: {
        labels: this.teamLabels,
        datasets: [
          {
            label: "ROS",
            backgroundColor: "#0ba7fb",
            data: this.ros
          },
          {
            label: "Internal",
            backgroundColor: "#0070ad",
            data: this.internalRevenue
          },
          {
            label: "External",
            backgroundColor: "#004569",
            data: this.externalRevenue
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: "top"
        },
        title:{
          display: true,
          text: "Revenue in € grouped by type of Revenue",
          fontSize: 18
        },
        scales: {
          xAxes: [
            {
              display: true,
              gridLines: {
                display: false
              },
              barPercentage: 0.7,
              categoryPercentage: 0.5,
              scaleLabel:  {
                display: true,
                labelString: "Teams/Practices",
                fontSize: 18
              }
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
              },
              scaleLabel:  {
                display: true,
                labelString: "Revenue in €",
                fontSize: 18
              }
            }
          ]
        }
      }
    });

    let corChartCanvas = this.elementRef.nativeElement.querySelector(
      `#corChart`
    );
    let corChartRef = corChartCanvas.getContext("2d");
    this.corChart = new Chart(corChartRef, {
      type: "bar",
      data: {
        labels: this.teamLabels,
        datasets: [
          {
            label: "COR",
            backgroundColor: "#0070ad",
            data: this.cor
          }
        ]
      },
      options: {
        legend: {
          display: true,
          position: "top"
        },
        title:{
          display: true,
          text: "COR in € averaged by billable Days",
          fontSize: 18
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
              },
              scaleLabel: {
                display: true,
                labelString: "Average of COR (averaged over Billable Days)",
                fontSize: 18
              }
            }
          ]
        }
      }
    });
  }
}
