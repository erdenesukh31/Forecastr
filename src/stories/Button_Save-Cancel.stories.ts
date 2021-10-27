// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import Button from './button.component';
import ButtonSaveCancelComponent from './Button_Save-Cancel.component';

// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'AdminDashboard/ButtonSaveCancelComponent',
  component: ButtonSaveCancelComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  parameters: {
  design: {
      type: 'figma',
      url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/ButtonSaveCancel'
  }
 }
} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<ButtonSaveCancelComponent> = (args: ButtonSaveCancelComponent) => ({
  props: args,

});

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Primary.args = {
  primary: true,
  label: 'ButtonSaveCancelComponent',
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/ButtonSaveCancel/Save/Default'
}
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'ButtonSaveCancelComponent',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'ButtonSaveCancelComponent',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'ButtonSaveCancelComponent',
};
