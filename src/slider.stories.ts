import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './slider';
import type { SliderValue, TaqwaSlider } from './slider';

type Args = Pick<TaqwaSlider, 'disabled' | 'required' | 'min' | 'max' | 'step' | 'largeStep' | 'orientation'> & {
  label: string;
  value: SliderValue;
};

function showFormData(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  form.querySelector('output')!.textContent = JSON.stringify([...new FormData(form)]);
}

const meta = {
  title: 'Components/Slider',
  component: 'taqwa-slider',
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Volume',
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    largeStep: 10,
    orientation: 'horizontal',
    disabled: false,
    required: false,
  },
  render: ({ label, value, min, max, step, largeStep, orientation, disabled, required }) => html`
    <form @submit=${showFormData} style="display: grid; gap: 1rem">
      <taqwa-slider
        name="volume"
        aria-label=${label}
        .value=${value}
        .min=${min}
        .max=${max}
        .step=${step}
        .largeStep=${largeStep}
        orientation=${orientation}
        ?disabled=${disabled}
        ?required=${required}
      ></taqwa-slider>
      <button type="submit">Submit</button>
      <output></output>
    </form>
  `,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Range: Story = {
  args: {
    label: 'Price range',
    value: [25, 75],
  },
};

export const Steps: Story = {
  args: {
    label: 'Playback speed',
    value: 400,
    min: 100,
    max: 900,
    step: 100,
    largeStep: 200,
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
