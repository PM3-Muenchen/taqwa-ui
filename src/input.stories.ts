import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './input';
import type { TaqwaInput } from './input';

type Args = Pick<TaqwaInput, 'type' | 'placeholder' | 'value' | 'disabled' | 'required' | 'readOnly'> & {
  label: string;
};

const meta = {
  title: 'Components/Input',
  component: 'taqwa-input',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Name',
    type: 'text',
    placeholder: 'e.g. Colm Tuite',
    value: '',
    disabled: false,
    required: false,
    readOnly: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
  },
  render: ({ label, type, placeholder, value, disabled, required, readOnly }) => html`
    <div style="width: 20rem">
      <taqwa-input
        aria-label=${label}
        type=${type}
        placeholder=${placeholder ?? ''}
        value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?readonly=${readOnly}
      ></taqwa-input>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
};

export const Number: Story = {
  args: {
    label: 'Quantity',
    type: 'number',
    placeholder: '',
    value: '2',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Read only for now',
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: 'Copied from the dashboard',
  },
};
