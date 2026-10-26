---
version: alpha
name: Taqwa
description: Calm, green, mobile-first web components with liquid-glass surfaces. A Lit port of Base UI.
colors:
  primary: "#2A7221"
  on-primary: "#FAFFF2"
  secondary: "#CFEE9E"
  on-secondary: "#152614"
  neutral: "#FAFFF2"
  on-surface: "#152614"
  surface: "#FAFFF2A8"
  muted: "#EDF3E5"
  on-muted: "#566452"
  accent: "#E6F8CD"
  border: "#D6DDCF"
  input: "#838F7E"
  ring: "#2A7221"
  error: "#B42318"
  on-error: "#FAFFF2"
  warning: "#9A6200"
typography:
  display-lg:
    fontFamily: Instrument Serif
    fontSize: 56px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.01em
  display-md:
    fontFamily: Instrument Serif
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.1
  headline-lg:
    fontFamily: Stack Sans Headline
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Stack Sans Headline
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  headline-sm:
    fontFamily: Stack Sans Headline
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.35
  body-mobile:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 24px
  body-desktop:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
rounded:
  control: 4px
  surface: 6px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  control-height-mobile: 44px
  control-height-desktop: 40px
  control-padding-mobile: 16px
  control-padding-desktop: 14px
  surface-padding: 24px
  breakpoint-md: 768px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    height: "{spacing.control-height-mobile}"
    padding: "{spacing.control-padding-mobile}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.control}"
  button-tertiary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.control}"
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    rounded: "{rounded.control}"
  input-field:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.control}"
    height: "{spacing.control-height-mobile}"
    padding: "{spacing.control-padding-mobile}"
  input-field-outline:
    backgroundColor: "{colors.input}"
    size: 1px
  focus-ring:
    backgroundColor: "{colors.ring}"
    size: 2px
  field-description:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-muted}"
    typography: "{typography.caption}"
  tabs-list:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.on-surface}"
  separator:
    backgroundColor: "{colors.border}"
    size: 1px
  toast-warning-icon:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.warning}"
  input-field-invalid:
    textColor: "{colors.error}"
  glass-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.surface}"
    padding: "{spacing.surface-padding}"
  list-item-highlighted:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.control}"
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.control}"
    size: 20px
  switch-thumb:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.full}"
  tooltip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.surface}"
---

# Taqwa

## Overview

Taqwa is quiet, grounded, and organic. Deep evergreen ink sits on an ivory page, with a single living green for action and a soft lime cream for selection. Layouts are **relaxed**: generous padding and gaps, never cramped. They are built **mobile first**, with comfortable 44px touch targets that tighten slightly on laptops (≥ 768px).

The signature material is **liquid glass**, in the spirit of iOS: floating surfaces are thick frosted panes with a bright specular rim. Interactive controls are calm at rest and turn to glass when touched or hovered. A highlight follows the pointer, and pressing makes the control swell gently with a springy, jelly-like bounce.

Components are Lit web components (Shadow DOM) that work in plain HTML, React (19 natively, or with the `@pm3/taqwa-ui/react` wrappers) and Astro.

## Colors

The palette has four brand colours and two functional colours (red and amber).

- **Evergreen (#152614):** the ink. Used for all text, icons and strong outlines. 15.6:1 on Ivory.
- **Ivory (#FAFFF2):** the page and every surface. A warm, faintly green white. It also works as text on Green and Red.
- **Green (#2A7221):** the only action colour. Used for primary buttons, checked and active states, slider ranges, and the focus ring. Ivory on Green is 5.9:1 (AA).
- **Lime cream (#CFEE9E):** selection and secondary emphasis. Used for secondary buttons, pressed toggles, progress and slider tracks, and the highlight tint on glass. Always paired with Evergreen text (12.4:1).
- **Signal red (#B42318):** errors and destructive actions only. 6.5:1 on Ivory.
- **Amber (#9A6200):** warning icons in toasts only. 5.0:1 on Ivory.

Neutral steps are mixed from Evergreen into Ivory (`color-mix(in oklab, …)`), so a re-theme stays coherent:

- muted 5%
- muted text 68% (6.2:1)
- border 14%
- input outline 48% (3.3:1, which meets the 3:1 non-text minimum)
- accent (selected or highlighted items): Lime cream at 45% on Ivory

Every value can be overridden at runtime with a `--taqwa-color-*` custom property on any ancestor.

## Typography

There are three typefaces, each with a strict role:

- **Inter:** all UI and body text. 15px / 24px on mobile and 14px / 20px from 768px up. Labels use weight 500.
- **Stack Sans Headline:** titles inside components (dialog, drawer, popover, toast titles, fieldset legends) and page headings. Weight 600 with slight negative tracking.
- **Instrument Serif:** display only, e.g. hero text and editorial moments. Never used for UI text, and no component uses it. It's available as `--taqwa-font-display`.

The package ships no font files. Load them in the app, for example from Google Fonts: `family=Inter:wght@400..700&family=Stack+Sans+Headline:wght@400..700&family=Instrument+Serif:ital@0;1`. Override them with `--taqwa-font-body`, `--taqwa-font-heading` and `--taqwa-font-display`.

## Layout

- **Mobile first** and fluid. Components fill their container width on small screens. At the `md` breakpoint (768px) controls shrink from 44px to 40px tall and their horizontal padding goes from 16px to 14px.
- **Spacing** uses a 4px base with a relaxed rhythm:
  - 12–16px between related items inside a component
  - 24px padding inside dialogs, drawers, popovers and cards
  - 24px between form fields
  - 8px between a label and its control
- **Overlays on mobile** become sheets: drawers are full-width bottom sheets with snap points, and toasts sit bottom centre at full width minus 16px. On wider screens, toasts move to the bottom right (max 24rem) and side drawers are at most 26rem wide.

## Elevation & Depth

Depth comes from **material**, not just shadow.

- **Page level:** flat Ivory.
- **Floating level (liquid glass):**
  - translucent Ivory (66%)
  - `backdrop-filter: blur(28px) saturate(1.8)`
  - a faint film grain
  - a 1px specular rim: bright at the top-left and bottom-right, fading through the middle
  - a soft, wide evergreen-tinted drop shadow
- **Interactive glass:** controls at rest are flat. Hover lifts the fill to about 72% opacity with a 14px blur, a pointer-tracking radial highlight, and inner top and bottom light edges. Press swells to scale 1.04 on a bouncy spring (visual duration 0.3s, bounce 0.35).
- **Modal backdrop:** frosted evergreen wash over the page.

All motion uses Motion (`motion`) springs; CSS transitions are not used. With `prefers-reduced-motion`, every animation is instant and only colour and opacity states change.

## Shapes

Corners are small and precise:

- 4px on controls (buttons, inputs, checkboxes, list items)
- 6px on floating surfaces (popovers, menus, dialogs, toasts)
- fully round only for avatars, radio buttons, switch tracks and thumbs, slider thumbs, and progress bars

Bottom sheets round only their top corners.

## Components

All 37 Base UI components are available as `taqwa-*` custom elements.

- **Buttons:** primary (Green), secondary (Lime cream), tertiary (transparent with a lime glass tint on hover), destructive (Red). All 44px tall on mobile and 40px from 768px.
- **Inputs:** an Ivory field with an input-coloured 1px outline. Focus shows a 2px Green ring offset by 2px. The invalid state uses a red outline with the message below in red, 13px.
- **Selection controls:** checked state is a Green fill with an Ivory icon. Pressed toggles and selected options use the Lime cream accent.
- **Lists and menus:** 44px rows on mobile and 36–40px from 768px. The highlighted row turns to glass with a lime tint.
- **Floating surfaces** (popover, menu, select, tooltip, preview card, toast, dialog, drawer) all use the liquid glass material.

## Do's and Don'ts

- Do use Green for the single most important action in a view. Use secondary or tertiary for everything else.
- Do pair Lime cream with Evergreen text only. Never put Ivory or Green text on Lime cream for body copy.
- Do keep 44px touch targets on mobile, even when the visual mark is smaller (checkbox 20px, slider thumb).
- Do reserve Instrument Serif for display moments. Don't use it inside controls.
- Don't stack glass on glass more than one level deep, because the blur turns muddy.
- Don't use red for anything other than errors and destructive actions.
- Don't mix rounded-full pills with 4px controls in the same group (except avatars and switches).
- Don't animate with CSS transitions. Use the shared Motion helpers so reduced motion is respected.
