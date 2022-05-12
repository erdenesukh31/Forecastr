/**
 * user structure
 */
export class User {
    /**
     * unique system id
     */
    id: number;

    /**
     * global capgemini id
     */
    globalId: number;
    firstName: string;
    lastName: string;
    email: string;

    /**
     * password: only used for creating new user
     */
    password?: string;

    /**
     * role id: permissions are dependent on role
     */
    roleId: number;
    permission: number;

    /**
     * parentId = id of teamlead
     */
    parentId: number;

    /**
     * gradeId = id of current position (e.g. Consultant)
     */
    gradeId?: number;

    /**
     * fte (full time equivalent): Working hours of employees per week. If 40 hours: fte = 1; if 30 hours: fte = 0.75, if 20 hours: fte = 0.50
     */
    fte: number;

    /**
     * inactive users cannot loggin anymore
     */
    active?: boolean;

    /**
     * has admin permissions
     */
    admin?: boolean;

    /**
     * true if user loggs in for first time or has not logged in for 2 months
     */
    showgetstarted?: boolean;

    startDate?: string;

    endDate?: string;

    prodUnitCode? : string;
    isRepresentedBy?: number;

    /**
     * new user constructor with default values
     */
    constructor() {
        this.startDate = null;
        this.endDate = null;
	    this.globalId = null;
		this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.roleId = null;
        this.parentId = null;
        this.gradeId = null;
        this.fte = 1;
        this.admin = false;
        this.active = true;
        this.prodUnitCode = null;
        this.isRepresentedBy = null;
	}
}
