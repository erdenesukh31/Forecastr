// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { FlyingButtonComponent } from './FlyingButton.component';
import { withDesign } from 'storybook-addon-designs'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule }from '@angular/material/button';

// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'AdminDashboard/FlyingButton',
  component: FlyingButtonComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  argTypes: {
  },
  decorators: [withDesign],
  parameters: {
 }
} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<FlyingButtonComponent> = (args: FlyingButtonComponent) => ({
  props: args,
  moduleMetadata: {
    imports: [
      MatIconModule,
      MatButtonModule
    ]
  }
});

export const AddUserDefault = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
AddUserDefault.args = {
  type: 'user',
  pressed: false,
  label: 'Add User'
};

AddUserDefault.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9bf8b3cad17b276828e',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2247'
  }
}

export const AddProjectDefault = Template.bind({});
AddProjectDefault.args = {
  type: 'project',
  pressed: false,
  label: 'Add Project',
};

AddProjectDefault.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9c00ac83412f6cbee15',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2249'
  }
}

export const AddTeamDefault = Template.bind({});
AddTeamDefault.args = {
  type: 'team',
  pressed: false,
  label: 'Add Team',
};

AddTeamDefault.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9bef2ab541516aff2a0',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2254'
  }
}


export const AddUserPressed = Template.bind({});
AddUserPressed.args = {
  type: 'user',
  pressed: true,
  label: 'Add User',
};

AddUserPressed.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9bfd2770f10af2f081f',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2259'
  }
}

export const AddProjectPressed = Template.bind({});
AddProjectPressed.args = {
  type: 'project',
  pressed: true,
  label: 'Add Project',
};

AddProjectPressed.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9c0a60011113007ec04',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2263'
  }
}

export const AddTeamPressed = Template.bind({});
AddTeamPressed.args = {
  type: 'team',
  pressed: true,
  label: 'Add Team',
};

AddTeamPressed.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=60f6b9bfeed29916c53a514c',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=426%3A2267'
  }
}

export const CSVDefault = Template.bind({});
CSVDefault.args = {
  type: 'csv',
  pressed: false,
  label: 'CSV',
};

CSVDefault.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=6193c2bd02d9b5adca05a138',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=534%3A3107'
  }
}

export const CSVPressed = Template.bind({});
CSVPressed.args = {
  type: 'csv',
  pressed: true,
  label: 'CSV',
};

CSVPressed.parameters = {
  zeplinLink:'zpl://components?pid=603f452486a2b41861334dd2&coid=6193c2bdc6b7b1a97541a886',
  design: {
    type: 'experimental-figspec',
    url: 'https://www.figma.com/file/BRHSpCecBd34FTyZAwtYFQ/Forecastr-Design?node-id=534%3A3112'
  }
}
