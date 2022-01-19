import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-power-bi",
    templateUrl: "./power-bi.component.html",
    styleUrls: ["./power-bi.component.scss"],
  })
  export class PowerBi implements OnInit {

    app: string = 'KPI';

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
      
  }