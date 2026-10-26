import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './otp-field';
import type { OtpMode, TaqwaOtpField } from './otp-field';

type Args = {
  label: string;
  length: number;
  mode: OtpMode;
  mask: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
} & Pick<TaqwaOtpField, 'value'>;

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

const meta = {
  title: 'Components/OTP Field',
  component: 'taqwa-otp-field',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Verification code',
    value: '',
    length: 6,
    mode: 'numeric',
    mask: false,
    disabled: false,
    required: false,
    readOnly: false,
  },
  render: ({ label, value, length, mode, mask, disabled, required, readOnly }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-otp-field
        name="code"
        aria-label=${label}
        .value=${value}
        .length=${length}
        mode=${mode}
        ?mask=${mask}
        ?disabled=${disabled}
        ?required=${required}
        ?read-only=${readOnly}
      ></taqwa-otp-field>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Alphanumeric: Story = {
  args: {
    label: 'Recovery code',
    mode: 'alphanumeric',
    length: 8,
  },
};

export const Masked: Story = {
  args: {
    label: 'Access code',
    mask: true,
    value: '1234',
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '123456',
  },
};
