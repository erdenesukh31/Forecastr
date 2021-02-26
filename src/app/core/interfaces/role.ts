/**
 * role types structure
 */
export interface Role {
	/**
	 * unique system id
	 */
	roleId: number;
	
	/**
	 * role name
	 */
	name: string;

	/**
	 * role shortcut
	 */
	shortcut: string;

	/**
	 * role description
	 */
	description: string;

	permissionType: any;

	/**
	 * role active attribute (currently ignored for roles)
	 */
	active: boolean;
}
