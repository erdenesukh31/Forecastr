// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import Button from './button.component';

<<<<<<< HEAD
export default {
  title: 'Example/Button',
  component: Button,
=======
// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
>>>>>>> storybook
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

<<<<<<< HEAD
=======
// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
>>>>>>> storybook
const Template: Story<Button> = (args: Button) => ({
  props: args,
});

export const Primary = Template.bind({});
<<<<<<< HEAD
=======
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
>>>>>>> storybook
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
