import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './dialog';
import './button';
import type { TaqwaDialog } from './dialog';

const stage = `min-height: 100vh; display: grid; place-items: center; padding: 2rem; box-sizing: border-box;`;

type Args = Pick<TaqwaDialog, 'modal' | 'disablePointerDismissal'> & {
  title: string;
  description: string;
};

const meta = {
  title: 'Components/Dialog',
  component: 'taqwa-dialog',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Rename project',
    description: 'Choose a name your team will recognise.',
    modal: true,
    disablePointerDismissal: false,
  },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
  render: ({ title, description, modal, disablePointerDismissal }) => html`
    <taqwa-dialog .modal=${modal} ?disable-pointer-dismissal=${disablePointerDismissal}>
      <taqwa-button slot="trigger">Open dialog</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <p>Projects appear in the sidebar and can be renamed at any time. Existing links keep working.</p>
      <taqwa-button slot="close" variant="secondary">Cancel</taqwa-button>
      <taqwa-button slot="close">Save</taqwa-button>
    </taqwa-dialog>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const NonModal: Story = {
  args: {
    modal: false,
    title: 'Quick notes',
    description: 'The page stays interactive while this is open.',
  },
};

export const DisablePointerDismissal: Story = {
  args: {
    disablePointerDismissal: true,
    description: 'Only Escape or the buttons close this dialog.',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Terms of service',
    description: 'Please read before continuing.',
  },
  render: ({ title, description }) => html`
    <taqwa-dialog>
      <taqwa-button slot="trigger" variant="secondary">Read terms</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      ${Array.from({ length: 12 }, (_, i) => html`<p>Section ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>`)}
      <taqwa-button slot="close">I agree</taqwa-button>
    </taqwa-dialog>
  `,
};
