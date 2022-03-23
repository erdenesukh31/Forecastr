import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: "app-flying-button",
  template: `
  <div [ngClass]=classes>
    <button
        type="button"
        (click)="onClick.emit($event);"
        [ngClass]=stateDefault
      >
        <div class="Content">
          <mat-icon class="img">{{icon}}</mat-icon>
          <div class="Label">
            {{ label }}
          </div>
        </div>
      </button>
    </div>`,
  styleUrls: [
    './FlyingButton.css'
  ],
})
export class FlyingButtonComponent {
  /**
   * Is this the principal call to action on the page?
   */
  @Input()
  type : 'team' | 'user' | 'project' | 'csv' | 'month';

  /**
   * Storybook selector
   */
  @Input()
  pressed? = false;

  /**
   * Button contents
   *
   * @required
   */
  @Input()
  label = 'Button';

  /**
   * Optional click handler
   */
  @Output()
  onClick = new EventEmitter<Event>();

  public get classes(): string[] {
    return [
    'Flying-Button'
    ];
  }

  public get icon(): string{
    switch(this.type){
      case  'user':
      case  'project':
      case  'team':
        return 'person_add';
      case  'csv':
        return 'file_download';
      case 'month':
        return 'playlist_add'
    }
  }

  public get stateDefault(): string[] {
    if(this.pressed)
      return ['StateOn-Click'];
    else
      return ['StateDefault'];
    }
}
