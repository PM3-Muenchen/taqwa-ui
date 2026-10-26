import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './autocomplete';
import type { TaqwaAutocomplete } from './autocomplete';

type Args = Pick<TaqwaAutocomplete, 'placeholder' | 'disabled' | 'required' | 'readOnly' | 'value' | 'mode'>;

const tags = [
  'feature',
  'fix',
  'bug',
  'docs',
  'internal',
  'mobile',
  'component: accordion',
  'component: autocomplete',
  'component: combobox',
  'component: select',
  'component: switch',
  'component: tabs',
];

const items = (names: string[]) => names.map((name) => html`<taqwa-autocomplete-item value=${name}>${name}</taqwa-autocomplete-item>`);

const onSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
};

const meta = {
  title: 'Components/Autocomplete',
  component: 'taqwa-autocomplete',
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'e.g. feature',
    value: '',
    disabled: false,
    required: false,
    readOnly: false,
    mode: 'list',
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['list', 'both'],
    },
  },
  render: ({ placeholder, value, disabled, required, readOnly, mode }) => html`
    <taqwa-autocomplete
      name="tag"
      placeholder=${placeholder}
      .value=${value}
      mode=${mode}
      ?disabled=${disabled}
      ?required=${required}
      ?readonly=${readOnly}
    >
      ${items(tags)}
    </taqwa-autocomplete>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Both: Story = {
  args: {
    mode: 'both',
  },
};

export const Prefilled: Story = {
  args: {
    value: 'comp',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'feature',
  },
};

export const Grouped: Story = {
  render: () => html`
    <taqwa-autocomplete name="tag" placeholder="e.g. Apple">
      <taqwa-autocomplete-group label="Fruits">${items(['Apple', 'Apricot', 'Avocado'])}</taqwa-autocomplete-group>
      <taqwa-autocomplete-group label="Vegetables">${items(['Artichoke', 'Asparagus'])}</taqwa-autocomplete-group>
    </taqwa-autocomplete>
  `,
};

export const InForm: Story = {
  render: () => html`
    <form style="display: grid; gap: 1rem; width: 16rem" @submit=${onSubmit}>
      <taqwa-autocomplete name="tag" placeholder="e.g. feature" required>${items(tags)}</taqwa-autocomplete>
      <taqwa-button type="submit">Submit</taqwa-button>
      <output style="font-family: monospace; font-size: 0.75rem; overflow-wrap: anywhere"></output>
    </form>
  `,
};

export const LiquidGlass: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => html`
    <div
      style="display: grid; place-items: center; min-height: 28rem; padding: 3rem;"
    >
      <taqwa-autocomplete name="tag" placeholder="e.g. feature">${items(tags)}</taqwa-autocomplete>
    </div>
  `,
};
