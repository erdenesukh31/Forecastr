/**
 * data structure for kpi dialog
 */
export interface MonthlySummaryReport {

    /**
     * Shortend name of the month (e. g. April = apr)
     */
    month: string;

    /**
     * Id of this month
     */
    monthId: number;

    /**
     * Number of this month in the year (e. g. August = 8)
     */
    monthNumber: string;

    /**
     * Year of this Month
     */
    year: number;

    /**
     * revenue for this month
     */
    ros: number;

    /**
     * external revenue for this month
     */
    externalRevenue: number;

    /**
     * internal revenue for this month
     */
    internalRevenue: number;

    /**
     * cor for this month
     */
    cor: number;

    /**
     * arve for this month
     */
    arve: number;

    /**
     * urve for this month
     */
    urve: number;

    /**
     * fte for this month
     */
    fte: number;
}