import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, type TemplateResult } from 'lit';
import './index';
import type { TaqwaButton } from './index';

type Args = Pick<TaqwaButton, 'variant' | 'disabled' | 'motionOptions'> & {
  label: string | TemplateResult;
};

const meta = {
  title: 'Components/Button',
  component: 'taqwa-button',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Continue',
    variant: 'primary',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
  },
  render: ({ label, variant, disabled, motionOptions }) => html`
    <taqwa-button variant=${variant} ?disabled=${disabled} .motionOptions=${motionOptions ?? nothing}>
      ${label}
    </taqwa-button>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
  },
};

export const WithIcon: Story = {
  args: {
    label: html`
      Continue
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    `,
  },
};

export const CustomMotion: Story = {
  args: {
    motionOptions: {
      hover: { scale: 1.05 },
      press: { scale: 0.96 },
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
  },
};
