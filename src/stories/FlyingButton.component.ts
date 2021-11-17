import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-flying-button',
  template: `
  <div [ngClass]=classes>
    <button
        type="button"
        (click)="onClick.emit($event);"
        [ngClass]=stateDefault
        [ngStyle]="{ 'background-color': backgroundColor }"
      >
        <div class="Content">
          <mat-icon>{{icon}}</mat-icon>
          <div [ngClass]=typeClass>
            {{ label }}
          </div>
        </div>
      </button>
    </div>`,
  styleUrls: ['./FlyingButton.css'],
})
export class FlyingButtonComponent {
  /**
   * Is this the principal call to action on the page?
   */
  @Input()
  type : 'team' | 'user' | 'project' | 'csv';

  /**
   * What background color to use
   */
  @Input()
  backgroundColor?: string;

  /**
   * How large should the button be?
   */
  @Input()
  pressed = false;

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
    'Flying-Button', 
    this.type];
  }

  public get icon(): string{
    switch(this.type){
      case  'user':
      case  'project':
      case  'team':
        return 'person_add';
      case  'csv':
        return 'file_download';
    }
  }

  public get typeClass(): string[] {
    switch(this.type){
      case  'user':
        return ['Add-User'];
      case  'team':
        return ['Add-Team'];
      case  'project':
        return ['Add-Project'];
      case  'csv':
        return ['CSV'];
    }
  }

  public get stateDefault(): string[] {
    switch(this.type){
      case  'user':
        if(this.pressed)
          return ['TypeUser-StateOn-Click'];
        else
          return ['TypeUser-StateDefault'];
      case  'team':
        if(this.pressed)
          return ['TypeTeam-StateOn-Click'];
        else
          return ['TypeTeam-StateDefault'];
      case  'project':
        if(this.pressed)
          return ['TypeProject-StateOn-Click'];
        else
          return ['TypeProject-StateDefault'];
      case  'csv':
        if(this.pressed)
          return ['TypeCSV-StateOn-Click'];
        else
          return ['TypeCSV-StateDefault'];
    }
  }
}
