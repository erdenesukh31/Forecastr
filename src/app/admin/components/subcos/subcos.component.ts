import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
@Component({
  selector: 'app-admin-subcos',
  templateUrl: './subcos.component.html',
  styleUrls: ['./subcos.component.scss']
})
export class SubcosComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * subcos list
   */

  constructor() { }

  ngOnInit(): void {
  }

}
