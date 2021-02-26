import { Component, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
/**
 * public root component of application
 */
@Component({
  selector: 'public-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  /**
   * init method for app component
   * registers de as locale (for number views)
   */
  ngOnInit(): void {
    registerLocaleData(localeDe, 'de');
  }
}
