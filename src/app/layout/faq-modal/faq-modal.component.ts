import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { faqData } from './faqData';
@Component({
  selector: 'app-faq-modal',
  templateUrl: './faq-modal.component.html',
  styleUrls: ['./faq-modal.component.scss']
})
export class FaqModalComponent implements OnInit {

  fd: any [];

  constructor(
    public dialogRef: MatDialogRef<FaqModalComponent>,
     ) { }

  ngOnInit() {
    this.fd = faqData
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
