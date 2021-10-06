import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { Month } from "../../../core/interfaces/month";
import { FinancialControllerSummaryAPPS } from "../../../core/interfaces/financialAppsSummary";
import { DatePipe } from "@angular/common";
import { ProbabilitySummary } from "../../../core/interfaces/probabilitySummary";

@Component({
  selector: 'app-subco-fc-external',
  templateUrl: './subco-fc-external.component.html',
  styleUrls: ['./subco-fc-external.component.scss'],
})
export class SubCoFcExternalComponent implements OnInit, OnDestroy {
    kpis: string[] = [
        "Ressource",
        "Project code",
        "Project name",
        "Engagement Manager",
        "Customer",
        "isEasternEurope",
        "Revenue",
        "Cost",
        "Contribution",
        "CP%"  
      ];
      
  @Input('months') months: Month[];

  /**
    * columns which are displayed
   */
  columnsToDisplay: String[] = [];
  columnsToDisplay2: String[] = [];

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

  ngOnDestroy(): void {
  }
}