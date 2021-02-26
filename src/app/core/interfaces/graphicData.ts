/**
 * data structure for graphic data
 */
export interface GraphicSummaryReport {

    /**
     * Name of the team (e. g. CSD)
     */
    team: string;

    /**
     * ARVE for this period
     */
    arve: number;

    /**
     * URVE for this period
     */
    urve: number;

    /**
     * Working Days in this Period
     */
    workingDays: number

    /**
     * revenue for this month
     */
    ros: number;

    /**
     * external revenue for this period
     */
    externalRevenue: number;

    /**
     * cor for this period
     */
    cor: number;

    /**
     * Project Type entries
     */
    projectTypes: GraphicSummaryProjectTypeEntry[];

    /**
     * Probability entries
     */
    probabilities: GraphicSummaryProbabilityEntry[];
}

/**
 * Simple Structure for Probability Entries
 */
export interface GraphicSummaryProbabilityEntry {

    /**
     * name of probability
     */
    probability: string;

    /**
     * days entered for the probability
     */
    days: number;
}

/**
 * Simple Structure for Project Type Entries
 */
export interface GraphicSummaryProjectTypeEntry {

    /**
     * Name of Project Type
     */
    projectType: string;

    /**
     * days entered for the project type
     */
    days: number;
}