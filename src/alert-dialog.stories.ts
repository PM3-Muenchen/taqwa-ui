import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './alert-dialog';
import './button';

const stage = `min-height: 100vh; display: grid; place-items: center; padding: 2rem; box-sizing: border-box;`;

type Args = {
  title: string;
  description: string;
  confirm: string;
};

const meta = {
  title: 'Components/Alert Dialog',
  component: 'taqwa-alert-dialog',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Discard draft?',
    description: 'This action cannot be undone.',
    confirm: 'Discard',
  },
  decorators: [(story) => html`<div style=${stage}>${story()}</div>`],
  render: ({ title, description, confirm }) => html`
    <taqwa-alert-dialog>
      <taqwa-button slot="trigger" variant="destructive">Discard draft</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <taqwa-button slot="close" variant="secondary">Cancel</taqwa-button>
      <taqwa-button slot="close" variant="destructive">${confirm}</taqwa-button>
    </taqwa-alert-dialog>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Confirm: Story = {
  args: {
    title: 'Publish changes?',
    description: 'Your edits go live for everyone on the team.',
    confirm: 'Publish',
  },
  render: ({ title, description, confirm }) => html`
    <taqwa-alert-dialog>
      <taqwa-button slot="trigger">Publish</taqwa-button>
      <span slot="title">${title}</span>
      <span slot="description">${description}</span>
      <taqwa-button slot="close" variant="tertiary">Not yet</taqwa-button>
      <taqwa-button slot="close">${confirm}</taqwa-button>
    </taqwa-alert-dialog>
  `,
};
