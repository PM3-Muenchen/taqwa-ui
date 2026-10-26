import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './meter';
import type { TaqwaMeter } from './meter';

type Args = Pick<TaqwaMeter, 'value' | 'min' | 'max' | 'format'> & { label: string };

const meta = {
  title: 'Components/Meter',
  component: 'taqwa-meter',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Storage used',
    value: 24,
    min: 0,
    max: 100,
  },
  decorators: [(story) => html`<div style="width: 20rem; max-width: 100%">${story()}</div>`],
  render: ({ label, value, min, max, format }) => html`
    <taqwa-meter .value=${value} .min=${min} .max=${max} .format=${format}>
      <span slot="label">${label}</span>
    </taqwa-meter>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Full: Story = {
  args: {
    label: 'Battery',
    value: 92,
  },
};

export const Rating: Story = {
  args: {
    label: 'Average rating',
    value: 4.2,
    min: 0,
    max: 5,
    format: { maximumFractionDigits: 1 },
  },
};
