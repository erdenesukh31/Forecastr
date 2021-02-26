import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { PageStateService } from '../../../core/shared/page-state.service';

import { CalculationService } from "../../../core/services/forecasts/calculation.service";
import { ProbabilitySummary } from "../../../core/interfaces/probabilitySummary";
import { ProbabilityRecord } from "../../../core/interfaces/probabilityRecord";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.scss']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input('summary') summary: any;

  loaded = false;

  probabilitySummary: ProbabilitySummary;
  
  probabilitySource: MatTableDataSource<ProbabilityRecord>;

  displayedColumns: string[] = [
    "probabilityId",
    "total",
    "billableDays",
    "vacationDays",
    "workingDays",
    "cor",
    "ros",
    "ext",
    "int",
    "arve",
    "urve"
  ];

  constructor(
    private pageState: PageStateService,
    private changeDetectorRefs: ChangeDetectorRef,
    private calculationService: CalculationService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.calculationService.probabilitySummary$.subscribe((summ: ProbabilitySummary) => {
      if(!this.loaded) {
        this.loaded = true;
      } else {
        this.probabilitySummary = summ;
        this.probabilitySource = new MatTableDataSource(summ.probabilites);
        this.changeDetectorRefs.detectChanges();
        setTimeout(() => {
          this.pageState.hideSpinner();
        }, 500);
      }
    });
  }

  exportCSV(): void {
    this.pageState.showSpinner();
    let lineEnding = "\r\n";

    let header = "KPI;" + this.probabilitySummary.probabilites.map(x => x.name).join(";") + ";Total" + lineEnding;
    let body = "ARVE;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.arve)).join(";") + ";" + this.numberToString(this.probabilitySummary.arve) + lineEnding
      + "URVE;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.urve)).join(";") + ";" + this.numberToString(this.probabilitySummary.urve) + lineEnding
      + "ROS;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.revenue)).join(";") + ";" + this.numberToString(this.probabilitySummary.revenue) + lineEnding
      + "Int. Revenue;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.internalRevenue)).join(";") + ";" + this.numberToString(this.probabilitySummary.internalRevenue) + lineEnding
      + "Ext. Revenue;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.externalRevenue)).join(";") + ";" + this.numberToString(this.probabilitySummary.externalRevenue) + lineEnding
      + "COR;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.cor)).join(";") + ";" + this.numberToString(this.probabilitySummary.cor) + lineEnding
      + "Paid Days;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.paidDays)).join(";") + ";" + this.numberToString(this.probabilitySummary.paidDays) + lineEnding
      + "Vacation Days;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.vacationDays)).join(";") + ";" + this.numberToString(this.probabilitySummary.vacationDays) + lineEnding
      + "Billable Days;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.billableDays)).join(";") + ";" + this.numberToString(this.probabilitySummary.billableDays) + lineEnding
      + "Project Days;" + this.probabilitySummary.probabilites.map(x => this.numberToString(x.billableDays + x.nonBillableDays)).join(";") + ";" + this.numberToString(this.probabilitySummary.nonBillableDays + this.probabilitySummary.billableDays) + lineEnding;

    const data = header + body;
    const blob: Blob = new Blob([data], { type: "text/csv" });
    const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-SummaryProbabilities.csv";    
    this.pageState.hideSpinner();

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

  numberToString(no: number): string {
    return no.toLocaleString("de",  { minimumFractionDigits: 2 } ).replace(".","");
  }
}

export interface PeriodicElement {
  name: string;
  firm: number;
  weight: number;
  symbol: string;
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
  urve: number;
  ros: number;
  external: number;
}