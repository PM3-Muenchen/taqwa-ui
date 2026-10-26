import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './progress';
import type { TaqwaProgress } from './progress';

type Args = Pick<TaqwaProgress, 'value' | 'min' | 'max' | 'format'> & { label: string };

const meta = {
  title: 'Components/Progress',
  component: 'taqwa-progress',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Export data',
    value: 40,
    min: 0,
    max: 100,
  },
  argTypes: {
    value: { control: { type: 'number' } },
  },
  decorators: [(story) => html`<div style="width: 20rem; max-width: 100%">${story()}</div>`],
  render: ({ label, value, min, max, format }) => html`
    <taqwa-progress .value=${value} .min=${min} .max=${max} .format=${format}>
      <span slot="label">${label}</span>
    </taqwa-progress>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Indeterminate: Story = {
  args: {
    value: null,
  },
};

export const Complete: Story = {
  args: {
    label: 'Upload',
    value: 100,
  },
};

export const Percent: Story = {
  args: {
    label: 'Storage used',
    value: 0.42,
    min: 0,
    max: 1,
    format: { style: 'percent' },
  },
};
