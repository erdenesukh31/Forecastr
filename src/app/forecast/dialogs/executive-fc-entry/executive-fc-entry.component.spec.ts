import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveFcEntryComponent } from './executive-fc-entry.component';

describe('ExecutiveFcEntryComponent', () => {
  let component: ExecutiveFcEntryComponent;
  let fixture: ComponentFixture<ExecutiveFcEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveFcEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveFcEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
