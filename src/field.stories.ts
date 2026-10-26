import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { z } from 'zod';
import './field';
import './input';
import type { TaqwaField, FieldValidationMode, FieldValidator } from './field';

type Args = Pick<TaqwaField, 'label' | 'description' | 'validationMode' | 'disabled' | 'invalid'> & {
  required: boolean;
};

const notTaken: FieldValidator = (value) =>
  value === 'ada@example.com' ? 'That email is already registered' : undefined;

const emailSchema = z.email('Enter a valid email address');

const meta = {
  title: 'Components/Field',
  component: 'taqwa-field',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Email',
    description: "We'll only use it for account notifications.",
    validationMode: 'submit',
    required: true,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    validationMode: {
      control: 'inline-radio',
      options: ['submit', 'blur', 'change'] satisfies FieldValidationMode[],
    },
  },
  render: ({ label, description, validationMode, required, disabled, invalid }) => html`
    <div style="width: 20rem">
      <taqwa-field
        label=${label}
        description=${description}
        validation-mode=${validationMode}
        ?disabled=${disabled}
        ?invalid=${invalid}
        .validate=${notTaken}
      >
        <taqwa-input type="email" placeholder="you@example.com" ?required=${required}></taqwa-input>
      </taqwa-field>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const ValidationModes: Story = {
  render: () => html`
    <div style="width: 20rem; display: flex; flex-direction: column; gap: 1.5rem">
      <taqwa-field label="Validate on submit (default)" description="Errors appear after you submit, then update as you type.">
        <taqwa-input type="email" required></taqwa-input>
      </taqwa-field>
      <taqwa-field label="Validate on blur" validation-mode="blur" description="Errors appear when you leave the field.">
        <taqwa-input type="email" required></taqwa-input>
      </taqwa-field>
      <taqwa-field label="Validate on change" validation-mode="change" description="Errors appear as you type.">
        <taqwa-input type="email" required></taqwa-input>
      </taqwa-field>
    </div>
  `,
};

export const CustomValidation: Story = {
  args: {
    label: 'Email',
    description: 'Try ada@example.com, which is already taken.',
    required: false,
  },
  render: () => html`
    <div style="width: 20rem">
      <taqwa-field label="Email" description="Try ada@example.com, which is already taken." .validate=${notTaken} validation-mode="blur">
        <taqwa-input type="email" placeholder="you@example.com"></taqwa-input>
      </taqwa-field>
    </div>
  `,
};

export const StandardSchema: Story = {
  args: {
    required: false,
  },
  render: () => html`
    <div style="width: 20rem">
      <taqwa-field label="Email" description="Checked with Zod." .schema=${emailSchema} validation-mode="change">
        <taqwa-input type="email" placeholder="you@example.com"></taqwa-input>
      </taqwa-field>
    </div>
  `,
};

export const Invalid: Story = {
  args: {
    invalid: true,
    required: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    required: false,
  },
};
