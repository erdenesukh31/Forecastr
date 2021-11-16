import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'button-save-cancel',
  template: ` <button
    type="button"
    (click)="onClick.emit($event)"
    [ngClass]="classes"
    [ngStyle]="{ 'background-color': backgroundColor }"
  >
    {{ label }}
  </button>`,
  styleUrls: ['./Button_Save-Cancel.css'],
})
export default class ButtonSaveCancelComponent {
  /**
   * Is this the principal call to action on the page?
   */
  @Input()
  type : 'save' | 'cancel';

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
    const mode = `button-save-cancel--${this.type}`;

    console.log(this.type);
    console.log(this.pressed);
    console.log(this.pressed ?  `button-save-cancel--${this.type}-pressed` : `button-save-cancel--${this.type}-default`);
    
    return [
    'button-save-cancel', 
    this.pressed ?  `button-save-cancel--${this.type}-pressed` : `button-save-cancel--${this.type}-default`, 
    mode];
  }
}
