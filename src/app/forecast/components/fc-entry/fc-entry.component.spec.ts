import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FcEntryComponent } from './fc-entry.component';

describe('FcEntryComponent', () => {
  let component: FcEntryComponent;
  let fixture: ComponentFixture<FcEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FcEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FcEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
