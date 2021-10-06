import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "../app-routing.module";
import { CommonModule } from "@angular/common";
import { CoreModule } from "../core/core.module";
import { LayoutModule } from "../layout/layout.module";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatDialogModule } from "@angular/material/dialog";

import { ForecastComponent } from "./forecast.component";
import { IndividualComponent } from "./pages/individual/individual.component";
import { TeamComponent } from "./pages/team/team.component";
import { SubcosComponent } from "./pages/subcos/subcos.component";
import { SubcosFinancialControllerComponent } from "./pages/subcos-financial-controller/subcos-financial-controller.component";

import { FcEntryComponent } from "./components/fc-entry/fc-entry.component";
import { FcProjectComponent } from "./components/fc-project/fc-project.component";
import { FcEntrySummaryComponent } from "./components/fc-entry-summary/fc-entry-summary.component";
import { TeamleadSummaryComponent } from "./components/teamlead-summary/teamlead-summary.component";
import { TeamleadMonthComponent } from "./components/teamlead-month/teamlead-month.component";
import { SubcoMonthComponent } from "./components/subco-month/subco-month.component";
import { SubcoSummaryComponent } from "./components/subco-summary/subco-summary.component";
import { SubcoFcEntryComponent } from "./components/subco-fc-entry/subco-fc-entry.component"
import { SubcoFcProjectComponent } from "./components/subco-fc-project/subco-fc-project.component"
import { SubcoExecutiveDetailComponent } from "./components/subco-executive-detail/subco-executive-detail.component"
import { PracticeComponent } from "./pages/practice/practice.component";

import { ConfirmMessageDialog } from "./dialogs/confirm-message/confirm-message.dialog";
import { ExportCsvDialog } from "./dialogs/export-csv/export-csv.dialog";
import { ProjectRequestDialog } from "./dialogs/add-project/project-request.dialog";
import { ExecutiveComponent } from "./pages/executive/executive.component";
import { ExecutiveDetailComponent } from "./components/executive-detail/executive-detail.component";
import { ExecutiveSummaryComponent } from "./components/executive-summary/executive-summary.component";

import { NgxPowerBiModule } from "ngx-powerbi";
import { ExecutiveFcEntryComponent } from "./dialogs/executive-fc-entry/executive-fc-entry.component";
import { FcEntryDetailDialogComponent } from "./components/executive-detail/fc-entry-detail-dialog.component";
import { ExecutiveChartComponent } from "./components/executive-chart/executive-chart.component";
import { ExecutiveStatsComponent } from './components/executive-stats/executive-stats.component';

import { StaffingComponent } from "./pages/staffing/staffing.component";
import { StaffingOverviewComponent } from "./components/staffing-overview/staffing-overview.component";
import { HeadOfPracticesComponent } from "./pages/head-of-practices/head-of-practices.component";
import { PracticesComponent } from "./pages/practices/practices.component";
import { FinancialControllerComponent } from "./pages/financial-controller/financial-controller.component";
import { FinancialControllerOverviewComponent } from "./components/financial-controller-overview/financial-controller-overview.component";
import { FcEntrySummaryVacationWarningComponent } from "./components/fc-entry-summary/vacation-warning/fc-entry-summary-vacation-warning.component";

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatBottomSheetModule,
    CoreModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    TranslateModule,
    NgxPowerBiModule
  ],
  providers: [],
  declarations: [
    ForecastComponent,
    IndividualComponent,
    TeamComponent,
    SubcosComponent,
    SubcosFinancialControllerComponent,
    PracticeComponent,
    FcEntryComponent,
    FcProjectComponent,
    FcEntrySummaryComponent,
    TeamleadMonthComponent,
    SubcoFcEntryComponent,
    SubcoFcProjectComponent,
    SubcoExecutiveDetailComponent,
    SubcoMonthComponent,
    SubcoSummaryComponent,
    TeamleadSummaryComponent,
    ExecutiveComponent,
    ExecutiveDetailComponent,
    ExecutiveSummaryComponent,
    ConfirmMessageDialog,
    ExportCsvDialog,
    ProjectRequestDialog,
    ExecutiveFcEntryComponent,
    FcEntryDetailDialogComponent,
    FcEntrySummaryVacationWarningComponent,
    PracticesComponent,
    ExecutiveChartComponent,
    ExecutiveStatsComponent,
    StaffingComponent,
    StaffingOverviewComponent,
    HeadOfPracticesComponent,
    FinancialControllerComponent,
    FinancialControllerOverviewComponent,
  ],
  exports: []
})
export class ForecastModule {}
