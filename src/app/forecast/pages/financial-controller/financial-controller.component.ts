import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subscription } from 'rxjs';
import { ExecutiveForecastsService } from '../../../core/services/forecasts/executive-forecasts.service';
import { PageStateService } from '../../../core/shared/page-state.service';
import { FinancialControllerSummaryAPPS } from "../../../core/interfaces/financialAppsSummary";
import { Month } from '../../../core/interfaces/month';
import { UtilitiesService } from "../../../core/services/utilities.service";
import { CalculationService } from "../../../core/services/forecasts/calculation.service";
import { ProbabilitySummary } from "../../../core/interfaces/probabilitySummary";

@Component({
  selector: "app-financial-controller",
  templateUrl: "./financial-controller.component.html",
  styleUrls: ["./financial-controller.component.scss"],
})
export class FinancialControllerComponent implements OnInit, OnDestroy {

  financial: FinancialControllerSummaryAPPS[] = [];

  probabilitySummaries: Map<number, ProbabilitySummary>;

  months: Month[];

  financialSubscription: Subscription;

  porbabilitySummarySubscription: Subscription;

  monthSubscription: Subscription;

  constructor(
    private executiveService: ExecutiveForecastsService,
		private pageState: PageStateService,
    private utilitiesService: UtilitiesService,
    private calculationService: CalculationService
  ) {
  }

  /**
   * init method
   */
  ngOnInit(): void {
    this.pageState.forecastrReady$.subscribe((ready: boolean) => {
			if (ready) {
				this.initFinancialView();
			}
		});
  }

  initFinancialView(): void {
    this.financialSubscription = this.executiveService.financialData$.subscribe((financialData: FinancialControllerSummaryAPPS[]) => {
      this.financial = financialData;
    });

    this.porbabilitySummarySubscription = this.calculationService.probabilitySummaryPerMonth$.subscribe((probabilitySummaries: Map<number,ProbabilitySummary>) =>{
      this.probabilitySummaries = probabilitySummaries;
    })

    this.monthSubscription = this.utilitiesService.months$.subscribe((months: Month[]) => {
      this.months = months.filter((m: Month) => m.active === true);
      var today = new Date();
      var todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      this.months = this.months.filter((m: Month) => new Date(m.time) >= todayMonth);

      if (this.months.length > 8) {
        this.months = this.months.slice(0,8);
      }

      if(this.months !== undefined && this.months.length > 0) {
        this.calculationService.init(this.months[0].id, this.months[this.months.length - 1].id);
        this.executiveService.initializeFinancialData(this.months[0].id, this.months[this.months.length - 1].id).then(() => {
          this.pageState.hideSpinner();
        });
      }
    });
  }

  /**
   * Unsubscribes services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.financialSubscription.unsubscribe();
    this.monthSubscription.unsubscribe();
  }
}