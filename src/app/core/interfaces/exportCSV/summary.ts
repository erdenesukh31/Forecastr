/**
 * Entry summary structure for csv export
 */
export class Summary {

  /**
   * Total number of assigned project days (does not include vacation, training, BDD days)
   */
  projectDays: number;

  /**
   * total vacation days
   */
  vacationDays: number;

  /**
   * total training days
   */
  trainingDays: number;

  /**
   * total business development days
   */
  businessDevelopmentDays: number;

  /**
   * total billable days
   */
  billableDays: number;

  /**
   * total non-billable days
   */
  nonbillableDays: number;

  /**
   * toal number of possible working days per month (for all teammembers)
   */
  totalWorkingDays: number;

  /**
   * average arve per teammember
   */
  arve: number;

  /**
   * average urve per teammember
   */
  urve: number;

  /**
   * total return on sales for team
   */
  ros: number;
}
