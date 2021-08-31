import { TranslateModule } from "@ngx-translate/core";
import { CoreModule } from "../core/core.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AppRoutingModule } from "../app-routing.module";

import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { TdMediaService } from "@covalent/core/media";
import { GetStarted } from "./getStartedModal/get-started.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatStepperModule } from "@angular/material/stepper";
import { FaqModalComponent } from "./faq-modal/faq-modal.component";
import { SafeHtmlPipe } from "../core/pipes/safe-html";
import { OrganizationDialogComponent } from "./organizationModal/organization-dialog.component";
import { CdkTreeModule } from "@angular/cdk/tree";
import { MatTreeModule } from "@angular/material/tree";
import { FeedBackDialogComponent } from "./dialogs/feedback/feedback-dialog.component";

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    CoreModule,
    AppRoutingModule,
    TranslateModule,
    MatStepperModule,
    CdkTreeModule,
    MatTreeModule,
  ],
  providers: [TdMediaService],
  declarations: [
    HeaderComponent,
    FooterComponent,
    GetStarted,
    FaqModalComponent,
    SafeHtmlPipe,
    OrganizationDialogComponent,
    FeedBackDialogComponent,
  ],
  exports: [HeaderComponent, FooterComponent],
  entryComponents: [GetStarted, FaqModalComponent, OrganizationDialogComponent],
})
export class LayoutModule {}
