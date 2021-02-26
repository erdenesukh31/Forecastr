/**
 * projects structure (projects that can be assigned to a forecast)
 */
export class Project {
	/**
	 * unique id
	 */
	id: number;

	/**
	 * project code (imported from ctr)
	 */
	code?: string;

	/**
	 * project name (imported from ctr)
	 */
	name: string;

	/**
	 * customer name (currently not set)
	 */
	customer?: string;

	/**
	 * billable default value
	 */
	billable?: boolean;

	/**
	 * is project mandatory?
	 * If yes: 'Y', if no: 'N'
	 */
	mandatory: string;

	/**
	 * Project type.
	 * 0: default, 1 - xx: special types
	 */
	projectType: number;

	/**
	 * if project is active or not (default: active)
	 */
	active?: boolean;

	/**
	 * new project constructor with default values
	 */
	constructor() {
		this.code = '';
		this.name = '';
		this.customer = '';
		this.mandatory = 'N';
		this.projectType = 0;
		this.billable = true;
		this.active = true;
	}
}
