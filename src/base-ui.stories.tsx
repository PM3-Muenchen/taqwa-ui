import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight } from "lucide-react";
import { Button, Checkbox, Input, Switch } from "./index";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Continue",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Continue <ArrowRight aria-hidden="true" size={16} />
      </>
    ),
  },
};

export const CustomMotion: Story = {
  args: {
    motionProps: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.96 },
      transition: { type: "spring", stiffness: 400, damping: 17 },
    },
  },
};
