import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './menu';

type Args = { openOnHover: boolean; disabled: boolean };

const meta = {
  title: 'Components/Menu',
  component: 'taqwa-menu',
  parameters: { layout: 'centered' },
  args: {
    openOnHover: false,
    disabled: false,
  },
  render: ({ openOnHover, disabled }) => html`
    <div style="padding: 1rem; border-radius: 0.5rem; background: linear-gradient(135deg, #f97316, #ec4899 45%, #6366f1);">
      <taqwa-menu ?open-on-hover=${openOnHover} ?disabled=${disabled}>
        <taqwa-button slot="trigger" variant="secondary">Song</taqwa-button>
        <taqwa-menu-item value="library">Add to library</taqwa-menu-item>
        <taqwa-menu-item value="playlist">Add to playlist</taqwa-menu-item>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-item value="next">Play next</taqwa-menu-item>
        <taqwa-menu-item value="last">Play last</taqwa-menu-item>
        <taqwa-menu-item value="favorite" disabled>Favorite</taqwa-menu-item>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-item value="share">Share</taqwa-menu-item>
      </taqwa-menu>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const OpenOnHover: Story = {
  args: { openOnHover: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const CheckboxAndRadioItems: Story = {
  render: () => html`
    <div style="padding: 1rem; border-radius: 0.5rem; background: linear-gradient(135deg, #f97316, #ec4899 45%, #6366f1);">
      <taqwa-menu>
        <taqwa-button slot="trigger" variant="secondary">View</taqwa-button>
        <taqwa-menu-group>
          <span slot="label">Sort by</span>
          <taqwa-menu-radio-group value="date">
            <taqwa-menu-radio-item value="date">Date</taqwa-menu-radio-item>
            <taqwa-menu-radio-item value="name">Name</taqwa-menu-radio-item>
            <taqwa-menu-radio-item value="type">Type</taqwa-menu-radio-item>
          </taqwa-menu-radio-group>
        </taqwa-menu-group>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-group>
          <span slot="label">Workspace</span>
          <taqwa-menu-checkbox-item checked>Minimap</taqwa-menu-checkbox-item>
          <taqwa-menu-checkbox-item checked>Search</taqwa-menu-checkbox-item>
          <taqwa-menu-checkbox-item>Sidebar</taqwa-menu-checkbox-item>
        </taqwa-menu-group>
      </taqwa-menu>
    </div>
  `,
};

export const Submenu: Story = {
  render: () => html`
    <div style="padding: 1rem; border-radius: 0.5rem; background: linear-gradient(135deg, #f97316, #ec4899 45%, #6366f1);">
      <taqwa-menu>
        <taqwa-button slot="trigger" variant="secondary">File</taqwa-button>
        <taqwa-menu-item>New</taqwa-menu-item>
        <taqwa-menu-item>Open</taqwa-menu-item>
        <taqwa-menu>
          <taqwa-menu-item slot="trigger">Export</taqwa-menu-item>
          <taqwa-menu-item>PDF</taqwa-menu-item>
          <taqwa-menu-item>PNG</taqwa-menu-item>
          <taqwa-menu-item>SVG</taqwa-menu-item>
        </taqwa-menu>
        <taqwa-menu-separator></taqwa-menu-separator>
        <taqwa-menu-item>Print</taqwa-menu-item>
      </taqwa-menu>
    </div>
  `,
};
