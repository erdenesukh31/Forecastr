export interface HierarchyNode {

    /**
     * GGID
     */
    id: string

    /**
     * First Name for the Node
     */
    firstName: string;

    /**
     * Last Name for the Node
     */
    lastName: string;

    /**
     * Role Shortcut (e.g. CSS, PDL, etc...)
     */
    role: string;

    /**
     * Grade Shortcutr
     */
    grade: string;

    /**
     * Children of the node (represents sub employees)
     */
    children: HierarchyNode[];
}