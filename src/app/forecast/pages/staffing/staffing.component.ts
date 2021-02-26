import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Subscription } from "rxjs";

import { environment as env } from "../../../../environments/environment.prod";

import { User } from "../../../core/interfaces/user";
import { Month } from "../../../core/interfaces/month";

import { UserService } from "../../../core/services/user.service";
import { UtilitiesService } from "../../../core/services/utilities.service";
import { PageStateService } from "../../../core/shared/page-state.service";
import { ExecutiveChartComponent } from "../../components/executive-chart/executive-chart.component";
import { AuthService } from "../../../core/security/auth.service";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { ExecutiveForecastsService } from "../../../core/services/forecasts/executive-forecasts.service";

@Component({
  selector: "app-staffing",
  templateUrl: "./staffing.component.html",
  styleUrls: ["./staffing.component.scss"]
})
export class StaffingComponent implements OnInit, OnDestroy {

  /**
   * next 6 months
   */
  availableMonths: Month[] = [];

    /**
   * Defines executive data view period (monthIDs)
   */
  period: any = { from: undefined, to: undefined };

  /**
   * all active users
   */
  users: User[] = []

  monthSubscription: Subscription;

  userSubscription: Subscription;

  months: Month[] = [];
  

  constructor(
    private utilitiesService: UtilitiesService,
    private pageState: PageStateService,
    private userService: UserService,
    public dialog: MatDialog,
    private authService: AuthService,
    private forecastService: ForecastService,
    private executiveService: ExecutiveForecastsService,
  ) {
  }

  ngOnInit(): void {
    this.pageState.forecastrReady$.subscribe((ready: boolean) => {
      if (ready && this.authService.hasRole(env.roles.msl)) {
        this.initStaffingView();
      }
    });
  }

  /**
   * initiates staffing view
   */
  initStaffingView(): void {
    this.monthSubscription = this.utilitiesService.months$.subscribe((months: Month[]) => {
      this.availableMonths = months;
      this.setDefaultPeriod();

      /**for (let month of months) {
        this.forecastService.initStaffingForecasts(month.id);
        this.executiveService.initializeDetailValues(month.id);
      }**/
    });

    this.userSubscription = this.userService.allUsers$.subscribe((user: User[]) => {
      this.users = user;
    });
  }

    /**
   * Sets the default period to current month until 6 months in the future
   */
  setDefaultPeriod(): void {
    let months: Month[] = this.utilitiesService.getMonths();

    for (let i: number = 0; i < months.length; i++) {
      if (
        Date.parse(months[i].time) >
        new Date().setMonth(new Date().getMonth())
      ) {
        this.period.from = i;
        this.period.to = i + 5;
        this.showPeriod();
        break;
      }
    }
  }

  ngOnDestroy(): void {
    this.monthSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
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
    for (let month of this.months) {
      this.forecastService.initStaffingForecasts(month.id);
      this.executiveService.initializeDetailValues(month.id);
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

    dialogRef.afterClosed().subscribe(() => { });
  }
}