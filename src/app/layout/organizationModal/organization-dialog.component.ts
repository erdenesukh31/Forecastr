import { Component, OnInit, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { ExecutiveForecastsService } from "../../core/services/forecasts/executive-forecasts.service";
import { BusinessOperationsService } from "../../core/shared/business-operations.service";
import { HierarchyNode } from "../../core/interfaces/hierarchyNode";

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: HierarchyNode[] = [];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  templateUrl: "./organization-dialog.component.html",
  styleUrls: ["./organization-dialog.component.scss"],
})
export class OrganizationDialogComponent {
  // tslint:disable: member-ordering
  // tslint:disable: typedef
  private _transformer = (node: HierarchyNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name:
        "Name: " +
        node.firstName +
        "  " +
        node.lastName +
        " |  Role: " +
        node.role +
        "  | Grade: " +
        node.grade,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private http: HttpClient,
    private dialogRef: MatDialogRef<OrganizationDialogComponent>,
    private BO: BusinessOperationsService,
    private executiveForecastsService: ExecutiveForecastsService
  ) {
    this.dataSource.data = TREE_DATA;
  }

  /**
   * init method
   */
  // tslint:disable: use-life-cycle-interface
  ngOnInit(): void {
    console.log("component initialized");
    this.http
      .get(this.BO.companyHierarchy())
      .subscribe((hierarchy: HierarchyNode) => {
        console.log(hierarchy);
        this.dataSource.data = [hierarchy];
      });
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  onNoClick(): void {
    this.dialogRef.close();
  }
}
