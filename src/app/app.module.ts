import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { LayoutModule } from "./layout/layout.module";
import { ForecastModule } from "./forecast/forecast.module";
import { AdminModule } from "./admin/admin.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { DatePipe } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SafeHtmlPipe } from "./core/pipes/safe-html";
import { DeviceDetectorModule } from "ngx-device-detector";
import { CustomDateAdapter } from './layout/custom-date-adapter';
import { DateAdapter } from "@angular/material/core";

/**
 * AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    LayoutModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    ForecastModule,
    AdminModule,
    FormsModule,
    DeviceDetectorModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [DatePipe,  {provide: DateAdapter, useClass: CustomDateAdapter}],
  bootstrap: [AppComponent],
})
export class AppModule {}
