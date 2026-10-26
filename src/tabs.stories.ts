import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './tabs';
import type { TaqwaTabs, TabsOrientation } from './tabs';

type Args = Pick<TaqwaTabs, 'value'> & {
  orientation: TabsOrientation;
  activateOnFocus: boolean;
  loopFocus: boolean;
  disabledTab: boolean;
};

const meta = {
  title: 'Components/Tabs',
  component: 'taqwa-tabs',
  parameters: {
    layout: 'centered',
  },
  args: {
    value: undefined,
    orientation: 'horizontal',
    activateOnFocus: false,
    loopFocus: true,
    disabledTab: false,
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  render: ({ value, orientation, activateOnFocus, loopFocus, disabledTab }) => html`
    <div style="width: min(28rem, 90vw)">
      <taqwa-tabs .value=${value} orientation=${orientation}>
        <taqwa-tabs-list ?activate-on-focus=${activateOnFocus} .loopFocus=${loopFocus}>
          <taqwa-tab value="overview">Overview</taqwa-tab>
          <taqwa-tab value="projects">Projects</taqwa-tab>
          <taqwa-tab value="account" ?disabled=${disabledTab}>Account</taqwa-tab>
        </taqwa-tabs-list>
        <taqwa-tabs-panel value="overview"><p>Workspace stats and activity.</p></taqwa-tabs-panel>
        <taqwa-tabs-panel value="projects"><p>Milestones and deadlines.</p></taqwa-tabs-panel>
        <taqwa-tabs-panel value="account"><p>Profile and preferences.</p></taqwa-tabs-panel>
      </taqwa-tabs>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const SecondTabSelected: Story = {
  args: {
    value: 'projects',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const ActivateOnFocus: Story = {
  args: {
    activateOnFocus: true,
  },
};

export const DisabledTab: Story = {
  args: {
    disabledTab: true,
  },
};
