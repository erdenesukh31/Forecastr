// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import Button from './button.component';
import ButtonSaveCancelComponent from './Button_Save-Cancel.component';
import { withDesign } from 'storybook-addon-designs'

// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'AdminDashboard/ButtonSaveCancelComponent',
  component: ButtonSaveCancelComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  decorators: [withDesign],
  parameters: {
 }
} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<ButtonSaveCancelComponent> = (args: ButtonSaveCancelComponent) => ({
  props: args,

});

export const SaveDefault = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
SaveDefault.args = {
  primary: true,
  label: 'ButtonSaveCancelComponent'
};

SaveDefault.parameters = {
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=322%3A1840'
  }
}

export const SavePressed = Template.bind({});
SavePressed.args = {
  label: 'ButtonSaveCancelComponent',
};

SavePressed.parameters = {
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=322%3A1847'
  }
}

export const CancelPressed = Template.bind({});
CancelPressed.args = {
  label: 'ButtonSaveCancelComponent',
};

CancelPressed.parameters = {
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=322%3A1849'
  }
}


export const CancelDefault = Template.bind({});
CancelDefault.args = {
  label: 'ButtonSaveCancelComponent',
};

CancelDefault.parameters = {
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=322%3A1838'
  }
}
