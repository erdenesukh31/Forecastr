import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcoFcEntryComponent } from './subco-fc-entry.component';

describe('SubcoFcEntryComponent', () => {
  let component: SubcoFcEntryComponent;
  let fixture: ComponentFixture<SubcoFcEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcoFcEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcoFcEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
