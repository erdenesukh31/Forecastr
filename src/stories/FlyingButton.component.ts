import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fyling-button',
  template: ` <button
    type="button"
    (click)="onClick.emit($event)"
    [ngClass]="classes"
    [ngStyle]="{ 'background-color': backgroundColor }"
  >
    {{ label }}
  </button>`,
  styleUrls: ['./FlyingButton.css'],
})
export default class FlyingButtonComponent {
  /**
   * Is this the principal call to action on the page?
   */
  @Input()
  type : 'addteam' | 'adduser' | 'addproject' | 'csv';

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
    const mode = `flying-button`;

    console.log(this.type);
    console.log(this.pressed);
    console.log(this.pressed ?  `flying-button--pressed` : `flying-button--default`);
    
    return [
    'flying-button', 
    this.pressed ?  `flying-button--pressed` : `flying-button--default`, 
    mode];
  }
}
