import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { z } from 'zod';
import './button';
import './field';
import './fieldset';
import './form';
import './input';
import type { FormErrors, TaqwaForm } from './form';

const schema = z.object({
  name: z.string().min(1, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  age: z.coerce.number('Age must be a number').int('Age must be a whole number').min(18, 'You must be 18 or older'),
  address: z.object({
    city: z.string().min(1, 'Enter your city'),
  }),
});

type Args = Pick<TaqwaForm, 'errors'> & { disabledFieldset: boolean };

const log = (event: Event) => console.info('form-submit', (event as CustomEvent).detail);

const fields = html`
  <taqwa-field name="name" label="Name">
    <taqwa-input autocomplete="name" placeholder="Ada Lovelace" required></taqwa-input>
  </taqwa-field>
  <taqwa-field name="email" label="Email" description="We'll send your receipt here.">
    <taqwa-input type="email" autocomplete="email" placeholder="you@example.com" required></taqwa-input>
  </taqwa-field>
  <taqwa-field name="age" label="Age">
    <taqwa-input type="number" inputmode="numeric" placeholder="18"></taqwa-input>
  </taqwa-field>
  <taqwa-field name="address.city" label="City">
    <taqwa-input autocomplete="address-level2" placeholder="London"></taqwa-input>
  </taqwa-field>
`;

const actions = html`
  <taqwa-button type="submit">Create account</taqwa-button>
  <taqwa-button type="reset" variant="tertiary">Reset</taqwa-button>
`;

const meta = {
  title: 'Components/Form',
  component: 'taqwa-form',
  parameters: {
    layout: 'centered',
  },
  args: {
    errors: {} satisfies FormErrors,
    disabledFieldset: false,
  },
  render: ({ errors, disabledFieldset }) => html`
    <div style="width: 22rem">
      <taqwa-form .schema=${schema} .errors=${errors} prevent-default-submit @form-submit=${log}>
        <form>
          ${disabledFieldset
            ? html`<taqwa-fieldset disabled>
                <span slot="legend">Account</span>
                ${fields}
              </taqwa-fieldset>`
            : fields}
          <div style="display: flex; gap: 0.75rem">${actions}</div>
        </form>
      </taqwa-form>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

// Submit with empty or invalid values to see the Zod issues routed to each field.
export const ZodSchema: Story = {};

export const ServerErrors: Story = {
  args: {
    errors: {
      email: 'This email is already registered',
      name: ['Names with numbers are not allowed', 'Try a shorter name'],
    },
  },
};

export const FieldsetDisabled: Story = {
  args: {
    disabledFieldset: true,
  },
};
