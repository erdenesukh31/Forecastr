/**
 * team structure
 */
export class Team {
  /**
   * unique id
   */
  teamId: number;

  /**
   * teamlead id
   */
  teamLeadId: number;

  /**
   * team name
   */
  name: string;

  parentTeamId?: number;
  countryCode?: string;

  /**
   * new team constructor with default values
   */
  constructor() {
    this.teamId = undefined;
    this.name = '';
  }
}
