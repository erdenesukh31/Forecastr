import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';

import { Subscription } from 'rxjs';
import { MonthService } from '../../../core/services/admin/months.service';
import { Month } from '../../../core/interfaces/month';
import { AddMonthDialog } from '../../dialogs/add-month/add-month.dialog';

/**
 * admin months table component
 */
@Component({
  selector: 'app-admin-months',
  templateUrl: './months.component.html',
  styleUrls: ['../../admin.component.scss', './months.component.scss'],
})
export class MonthsComponent implements OnInit, OnDestroy {
  /**
   * Sort variable for angular material table sort method
   */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * available months
   */
  months: MatTableDataSource<Month>;

  /**
   * month subscription from utilities Service
   */
  monthsSubscription: Subscription;

  /**
   * constructor for utilities Service (needed for months request)
   * @param dialog
   * @param monthService
   */
  constructor(
    private dialog: MatDialog,
    private monthService: MonthService,
  ) {}

  /**
   * inits months variable
   */
	ngOnInit(): void {
    this.monthService.initializeMonths();

    this.monthsSubscription = this.monthService.months$
      .subscribe((months: Month[]) => {
        this.months = new MatTableDataSource(months);
        this.months.sort = this.sort;
      });
  }

  /**
   * unsubscribes month subscription
   */
  ngOnDestroy(): void {
    this.monthsSubscription.unsubscribe();
  }

  /**
   * Calls add month dialog
   */
  addMonth(): void {
    this.showEditDialog(new Month());
  }

  /**
   * Calls edit month dialog
   * @param id
   */
  updateMonth(id: number): void {
    this.showEditDialog(this.months.data.find((m: Month) => m.id === id));
  }

  /**
   * Called to set month active state
   * @param id
   * @param active
   */
  setMonthActiveState(id: number, active: boolean): void {
    this.monthService.setMonthActiveState(id, active);
  }

  /**
   * Opens dialog window to add/edit month
   * @param month
   */
  showEditDialog(month: Month): void {
    let dialogRef: any = this.dialog.open(AddMonthDialog, {
      data: {
        month: month,
      },
    });
    dialogRef.afterClosed().subscribe((m: Month | boolean) => {
      if (m) {
        this.monthService.setMonth(<Month>m);
      }
    });
  }
}
