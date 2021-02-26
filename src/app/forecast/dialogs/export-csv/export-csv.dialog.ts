import { Component, Inject } from "@angular/core";
import { Month } from "../../../core/interfaces/month";
import { MAT_DIALOG_DATA } from "@angular/material";

/**
 * Component for CSV-Export Dialog
 */
@Component({
  templateUrl: './export-csv.dialog.html',
  styleUrls: ["./export-csv.dialog.scss"]
}) export class ExportCsvDialog {
  /**
   * month list
   */
  months: Month[];

  /**
   * ids of months which should be exported in csv
   * default: id of current month
   */
  allMonths: {
    checked: boolean,
    indeterminate: boolean,
  };

  /**
   * initializes global variables
   * @param data
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.allMonths = { checked: false, indeterminate: false };
    this.months = data.months;
  }

  /**
   * updates allMonths checkbox if individual month is selected/deselected
   */
  checkMonth(): void {
    if (this.months.filter((m: Month) => m.checked).length === this.months.length) {
	    this.allMonths = { checked: true, indeterminate: false };
    } else if (this.months.filter((m: Month) => m.checked).length > 0) {
      this.allMonths = { checked: false, indeterminate: true };
    } else {
      this.allMonths = { checked: false, indeterminate: false };
    }
  }

  /**
   * Checks/unchecks all months when allMonths checkbox is used
   */
  checkAll(): void {
    if (this.allMonths.checked) {
      this.months.forEach((m: Month) => { m.checked = true; });
    } else {
      this.months.forEach((m: Month) => { m.checked = false; });
    }
  }

  /**
   * returns IDs of selected months
   */
  getExportMonths(): number[] {
    return this.months.filter((m: Month) => m.checked).map((m: Month) => m.id);
  }
}
