import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { Bold, Heart, Italic, Underline } from 'lucide';
import { icon } from './internal/icons';
import './toggle';
import type { TaqwaToggle } from './toggle';

type Args = Pick<TaqwaToggle, 'pressed' | 'disabled'> & {
  label: string | TemplateResult;
};

const meta = {
  title: 'Components/Toggle',
  component: 'taqwa-toggle',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Bold',
    pressed: false,
    disabled: false,
  },
  render: ({ label, pressed, disabled }) => html`
    <taqwa-toggle .pressed=${pressed} ?disabled=${disabled}>${label}</taqwa-toggle>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Pressed: Story = {
  args: {
    pressed: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const IconOnly: Story = {
  args: {
    label: html`${icon(Heart)}`,
  },
};

export const Formatting: Story = {
  args: {
    label: html`${icon(Bold)} Bold`,
    pressed: true,
  },
};

export const OnColorfulBackground: Story = {
  render: () => html`
    <div
      style="display: flex; gap: 0.75rem; padding: 2rem; border-radius: 1rem;"
    >
      <taqwa-toggle aria-label="Bold">${icon(Bold)}</taqwa-toggle>
      <taqwa-toggle aria-label="Italic" pressed>${icon(Italic)}</taqwa-toggle>
      <taqwa-toggle aria-label="Underline">${icon(Underline)}</taqwa-toggle>
    </div>
  `,
};
