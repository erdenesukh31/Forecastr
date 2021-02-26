/**
 * month data structure
 */
export class Month {
  /**
   * unique system id
   */
  id: number;

  /**
   * month name
   */
  name: string;

  /**
   * possible working days for month
   */
  workingdays: string;

  /**
   * Time of start of month
   * E.g. for April 2019: 20190401T00:00:00
   */
  time: string;

  /**
   * Used for csv export
   */
  checked?: boolean;

  /**
   * Active value for a month (only active months can be seen)
   * Default: true
   */
  active?: boolean;

  /**
   * Value for whether the month is submitted and locked.
   */
  locked?: boolean;

    /**
   * Value for whether the month is submitted and saved.
   */
  saved?: boolean;

  /**
   * constructor with default values
   */
  constructor() {
    let d: Date = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);

    this.name = "";
    this.workingdays = "0";
    this.time = d.toISOString();
    this.active = true;
  }
}
