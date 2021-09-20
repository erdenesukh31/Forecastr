
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Month } from '../../../core/interfaces/month';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../../core/services/utilities.service';
import { PageStateService } from '../../../core/shared/page-state.service';
import { ExecutiveChartComponent } from "../../components/executive-chart/executive-chart.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-subcos',
  templateUrl: './subcos.component.html',
  styleUrls: ['./subcos.component.scss']
})
export class SubcosComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }

}