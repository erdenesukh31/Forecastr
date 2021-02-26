import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';

/**
 * Main admin component (called at /admin)
 */
@Component({
  selector: 'public-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  /**
   * Constructor for angular/router
   * @param router
   */
  constructor(
    private router: Router,
  ) {}

  /**
   * Redirects to specific page if it is defined in url
   * Initializes utility data
   */
  ngOnInit(): void {
    this.router.navigate(['/' + environment.routes.admin]);
  }
}
