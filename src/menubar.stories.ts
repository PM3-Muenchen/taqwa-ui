import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './menu';
import './menubar';

type Args = { orientation: 'horizontal' | 'vertical'; loopFocus: boolean };

const meta = {
  title: 'Components/Menubar',
  component: 'taqwa-menubar',
  parameters: { layout: 'centered' },
  args: {
    orientation: 'horizontal',
    loopFocus: true,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: ({ orientation, loopFocus }) => html`
    <div style="padding: 2.5rem; border-radius: 0.5rem;">
      <taqwa-menubar orientation=${orientation} loop-focus=${String(loopFocus)}>
        <taqwa-menu>
          <taqwa-button slot="trigger" variant="tertiary">File</taqwa-button>
          <taqwa-menu-item>New</taqwa-menu-item>
          <taqwa-menu-item>Open</taqwa-menu-item>
          <taqwa-menu-item>Save</taqwa-menu-item>
          <taqwa-menu>
            <taqwa-menu-item slot="trigger">Export</taqwa-menu-item>
            <taqwa-menu-item>PDF</taqwa-menu-item>
            <taqwa-menu-item>PNG</taqwa-menu-item>
            <taqwa-menu-item>SVG</taqwa-menu-item>
          </taqwa-menu>
          <taqwa-menu-separator></taqwa-menu-separator>
          <taqwa-menu-item>Print</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-menu>
          <taqwa-button slot="trigger" variant="tertiary">Edit</taqwa-button>
          <taqwa-menu-item>Cut</taqwa-menu-item>
          <taqwa-menu-item>Copy</taqwa-menu-item>
          <taqwa-menu-item>Paste</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-menu>
          <taqwa-button slot="trigger" variant="tertiary">View</taqwa-button>
          <taqwa-menu-item>Zoom in</taqwa-menu-item>
          <taqwa-menu-item>Zoom out</taqwa-menu-item>
          <taqwa-menu-separator></taqwa-menu-separator>
          <taqwa-menu-item>Full screen</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-menu disabled>
          <taqwa-button slot="trigger" variant="tertiary" disabled>Help</taqwa-button>
        </taqwa-menu>
      </taqwa-menubar>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

export const NoLoopFocus: Story = {
  args: { loopFocus: false },
};
