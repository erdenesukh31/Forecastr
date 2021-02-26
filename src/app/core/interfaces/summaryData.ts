/**
 * summary-data structure
 */
export interface SummaryData {
  /**
   * SummaryDataProject array with calculated values
   */
  days: SummaryDataProject[];

  /**
   * total revenue of all employees in one month
   */
  revenue: number;

  /**
   * external revenue of all employees in one month
   */
  extRevenue : number;

  /**
   * internal revenue of all employees in one month
   */
  intRevenue : number;

  /**
   * total working days per month
   */
  workingDays: number;

  /**
   * number of billable working days
   */
  billableDays: number;

  /**
   * total possible days - billable working days
   */
  nonbillableDays: number;

  /**
   * weighted average of team-member arve values
   */
  arve: number;

  /**
   * weighted average of team-member urve values
   */
  urve: number;
}

/**
 * summary-data projects structure
 */
export interface SummaryDataProject {
  /**
   * days title (e.g. 'Vacation', 'Training', 'Projects')
   */
  title: string;

  /**
   * Number of total days
   */
  days: number;

  /**
   * type equal to project-type
   */
  type: number;
}
