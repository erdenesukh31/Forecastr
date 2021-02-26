/**
 * Single entry structure for csv export
 */
export class Entry {

  /**
   * entry (project) name
   */
  name: string;

  /**
   * number of working days (project + vacation + training + bdd days)
   */
  workingDays: number;

  /**
   * arve = (projectdays billable + non-billable) / (totalworkingdays - vacationdays)
   */
  arve: number;

  /**
   * urve = (projectdays billable) / (totalworkingdays - vacationdays)
   */
  urve: number;

  /**
   * Return on sales of all projects
   */
  ros: number;
}
