import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './button';
import './field';
import './fieldset';
import './input';
import type { TaqwaFieldset } from './fieldset';

type Args = Pick<TaqwaFieldset, 'disabled'> & { legend: string };

const meta = {
  title: 'Components/Fieldset',
  component: 'taqwa-fieldset',
  parameters: {
    layout: 'centered',
  },
  args: {
    legend: 'Shipping address',
    disabled: false,
  },
  render: ({ legend, disabled }) => html`
    <div style="width: 20rem">
      <taqwa-fieldset ?disabled=${disabled}>
        <span slot="legend">${legend}</span>
        <taqwa-field label="Street">
          <taqwa-input name="street" placeholder="12 Mill Lane"></taqwa-input>
        </taqwa-field>
        <taqwa-field label="City">
          <taqwa-input name="city" placeholder="Leeds"></taqwa-input>
        </taqwa-field>
        <taqwa-button variant="secondary">Use my location</taqwa-button>
      </taqwa-fieldset>
    </div>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithoutLegend: Story = {
  render: () => html`
    <div style="width: 20rem">
      <taqwa-fieldset>
        <taqwa-field label="Promo code">
          <taqwa-input placeholder="SPRING26"></taqwa-input>
        </taqwa-field>
      </taqwa-fieldset>
    </div>
  `,
};
