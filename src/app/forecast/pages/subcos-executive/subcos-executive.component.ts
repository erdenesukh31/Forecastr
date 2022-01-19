import { Component, OnInit, OnDestroy } from '@angular/core';
import { Month } from '../../../core/interfaces/month';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../../core/services/utilities.service';
import { PageStateService } from '../../../core/shared/page-state.service';
import { ExecutiveChartComponent } from "../../components/executive-chart/executive-chart.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-subcos-executive',
  templateUrl: './subcos-executive.component.html',
  styleUrls: ['./subcos-executive.component.scss']
})
export class SubcosExecutiveComponent implements OnInit, OnDestroy {

  monthSubscription: Subscription;

  months: Month[] = [];

  availableMonths: Month[] = [];

  period: any = { from: undefined, to: undefined };

  viewSwitch: string;


  constructor(
    private utilitiesService: UtilitiesService,
    private pageState: PageStateService,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.pageState.forecastrReady$.subscribe((ready:boolean)=> {
      if (ready) {
         this.initPracticesView();
      }
    });
  }

  ngOnDestroy(): void {
    this.monthSubscription.unsubscribe();
  }

  initPracticesView(): void {
    this.monthSubscription = this.utilitiesService.months$.subscribe((months: Month[]) => {
      this.availableMonths = months;
      this.setDefaultPeriod();
    });
  }

      /**
   * Reloads the values after period update
   */
  showPeriod(): void {
    if (this.period.to < this.period.from) {
      this.period.to = this.period.from;
    }

    this.pageState.showSpinner();
    this.months = this.utilitiesService
      .getMonths()
      .filter((m: Month) => m.id >= this.period.from && m.id <= this.period.to);
    this.pageState.hideSpinner();
  }

  /**
   * Sets the default period to current month until 6 months in the future
   */
  setDefaultPeriod(): void {
    let months: Month[] = this.utilitiesService.getMonths();

    for (let i: number = 0; i < months.length; i++) {
      if (
        Date.parse(months[i].time) >
        new Date().setMonth(new Date().getMonth() + 1)
      ) {
        this.period.from = i;
        this.period.to = i + 5;
        this.showPeriod();
        break;
      }
    }
  }
  
  /**Open dialog for executive chart */
  openDialog(): void {
    const dialogRef = this.dialog.open(ExecutiveChartComponent, {
      height: "90%",
      width: "90%",
      panelClass: "custom-dialog-container",
      data: {},
    });
    dialogRef.afterClosed().subscribe(() => {  });
  }

  changeViewSwitch(switchState: string): void {
    this.viewSwitch = switchState;
  }
}
