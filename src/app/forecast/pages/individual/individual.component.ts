import { Component, OnInit, OnDestroy, InjectionToken, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { UtilitiesService } from '../../../core/services/utilities.service';
import { AuthService } from '../../../core/security/auth.service';

import { Month } from '../../../core/interfaces/month';
import { Subscription } from 'rxjs';
import { PageStateService } from '../../../core/shared/page-state.service';
import { ForecastService } from '../../../core/services/forecasts/forecast.service';
import { MonthService } from '../../../core/services/admin/months.service';
import { LockedMonth } from '../../../core/interfaces/lockedMonth';
import { SavedMonth } from '../../../core/interfaces/savedMonth';

/**
 * individual forecast-view component
 */
@Component({
	selector: "app-individual",
	templateUrl: "./individual.component.html",
	styleUrls: ["./individual.component.scss"]
})
export class IndividualComponent implements OnInit, OnDestroy {
	/**
	 * id of currently logged-in user (received from auth-service)
	 */
	userId: number;

	months: Month[];

	monthSubscription: Subscription;

	/**
	 * index of currently selected tab (= month)
	 */
	activeMonth: number = 0;

	/**
	 * individual forecast-view component constructor
	 */
	constructor(
		private location: Location,
		private route: ActivatedRoute,
		private authService: AuthService,
		private utilitiesService: UtilitiesService,
		private pageState: PageStateService,
		private forecastService: ForecastService,
		private monthService: MonthService,
	) {
		this.userId = this.authService.getUserId();
	}

	/**
	 * Initializes forecast component
	 */
	ngOnInit(): void {
		this.pageState.forecastrReady$.subscribe((ready: boolean) => {
			if (ready) {
				this.initInvidualForecast();
			}
		});
	}

	/**
  	 * Unsubscribes services when component gets destroyed
 	 */
	ngOnDestroy(): void {
		this.monthSubscription.unsubscribe();
	}

	private initInvidualForecast(): void {
		this.monthSubscription = this.utilitiesService.months$
			.subscribe((months: Month[]) => {
				this.months = months.filter((m: Month) => m.active === true);
				var today = new Date();
				var todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

								this.months = this.months.filter((m: Month) => new Date(m.time) >= todayMonth);
				
								if(this.months.length > 7) {
									this.months = this.months.slice(1, 7);
								}
				
				let id: number = parseInt(this.route.snapshot.paramMap.get('id'), 10);
				if (typeof id !== 'undefined' && id >= 0 && id < this.months.length) {
					this.activeMonth = id;

				} else {
					for (let i: number = 0; i < this.months.length; i++) {
						if (Date.parse(this.months[i].time) > (new Date()).setMonth((new Date().getMonth() - 1))) {
							this.activeMonth = i;
							break;
						}
					}
				}

				setTimeout(() => {
					//FC failed to execute "getComputedStyle"
					let shift: number = parseInt(window.getComputedStyle(document.querySelector('.mat-tab-label-container')).width) - parseInt(window.getComputedStyle(document.querySelector('.mat-tab-list')).width);
					let pos: number = parseInt((document.querySelector('.mat-tab-label-active') as HTMLElement).getAttribute('aria-posinset'), 10);
					if (shift < ((pos ? pos : 1) - 1) * -100) {
						shift = ((pos ? pos : 1) - 1) * -100;
					}

					(document.querySelector('.mat-tab-list') as HTMLElement).style.transform = 'translateX(' + shift + 'px)';
				}, 100);
			});

		this.monthService.getLockedMonths().subscribe(
			(lockedMonths: LockedMonth[]) => {
				let activeLockedMonths = lockedMonths.filter((m: LockedMonth) => this.months.find((x: Month) => x.id === m.id) !== undefined);
				for (let i = 0; i < this.months.length; i++) {
					this.months[i].locked = activeLockedMonths[i].locked;
				}
			}
		);

		this.monthService.getSavedMonths().subscribe(
			(savedMonths: SavedMonth[]) => {
				let activeSavedMonths = savedMonths.filter((m: SavedMonth) => this.months.find((x: Month) => x.id === m.id) !== undefined);
				for (let i = 0; i < this.months.length; i++) {
					this.months[i].saved = activeSavedMonths[i].locked;
				}
			}
		);
	}

	/**
	 * Sets a different tab active and sets url according to it
	 * @param e
	 */
	setTabActive(e: number): void {
		this.activeMonth = e;
		this.location.replaceState('/forecast/individual/' + this.activeMonth);
	}

	forecastState(type: string, monthId: number): boolean {
		return this.forecastService.checkForecastState(type, monthId, this.userId);
	}
}
