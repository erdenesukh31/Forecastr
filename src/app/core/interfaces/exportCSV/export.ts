import { Entry } from "./entry";
import { Summary } from "./summary";

/**
 * Export item structure for csv export
 */
export class Export {
  /**
   * id of selected month
   */
  monthId: number;

  /**
   * constructor for Export class needed
   */
  constructor(
    /**
     * array of entries from all teammembers
     */
    public employeeEntry: Entry[] = [],

    /**
     * summary data of teammember
     */
    public summary: Summary = new Summary(),
  ) {}
}
