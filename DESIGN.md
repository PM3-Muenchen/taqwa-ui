---
version: alpha
name: Taqwa
description: Calm, green, mobile-first web components with frosted glass on a solid Ivory page. A Lit port of Base UI.
colors:
  primary: "#21602A"
  on-primary: "#FAFFF2"
  secondary: "#D9F2A6"
  on-secondary: "#152614"
  neutral: "#FAFFF2"
  on-surface: "#152614"
  surface: "#FAFFF2A3"
  field: "#FFFFFFB3"
  muted: "#EDF3E5"
  on-muted: "#4D5C4A"
  accent: "#EBF9D1"
  border: "#CAD6C4"
  input: "#637E61"
  ring: "#21602A"
  error: "#B42318"
  on-error: "#FAFFF2"
  warning: "#875600"
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
    fontFamily: Instrument Sans
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Instrument Sans
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  headline-sm:
    fontFamily: Instrument Sans
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
  control: 6px
  surface: 10px
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
    backgroundColor: "{colors.field}"
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
    rounded: 4px
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

Taqwa is calm, airy and professional: **Frosted Meadow**. Deep evergreen ink sits on frosted ivory glass, and the glass floats over a solid Ivory page. A single deep, refined green carries the action; lime cream marks selection. Layouts are **relaxed**: generous padding and gaps, never cramped. They are built **mobile first**, with comfortable 44px touch targets that tighten slightly on laptops (≥ 768px).

The material is **visible frosted glass**: floating surfaces are translucent ivory panes over a strong, saturated blur, with a white top highlight, a hairline edge, a soft green-tinted shadow and a fine film grain. Controls are calm and flat; solid buttons get a faint vertical sheen and an inner highlight. Motion stays plain: short fades, and buttons give a barely-there 0.98 press.

Components are Lit web components (Shadow DOM) that work in plain HTML, React (19 natively, or with the `@pm3munchen/taqwa-ui/react` wrappers) and Astro.

## Colors

The palette has four brand colours and two functional colours (red and amber).

- **Evergreen (#152614):** the ink. Used for all text, icons and strong outlines. 15.7:1 on Ivory.
- **Ivory (#FAFFF2):** the base of every glass pane, tab indicator and thumb. A warm, faintly green white. It is also the text colour on Green and Red.
- **Green (#21602A):** the only action colour, deep and refined. Used for primary buttons, checked and active states, slider and progress ranges, and the focus ring. Ivory on Green is 7.5:1 (6.4:1 at the lightest point of the button sheen).
- **Lime cream (#D9F2A6):** selection and secondary emphasis. Used for secondary buttons, pressed toggles, avatars, and progress and slider tracks. Always paired with Evergreen text (13.0:1).
- **Signal red (#B42318):** errors and destructive actions only. 6.5:1 on Ivory, and as a button fill with Ivory text.
- **Amber (#875600):** warning icons in toasts only. 6.1:1 on Ivory, 5.4:1 on glass.

Neutral steps are mixed from Evergreen into Ivory (`color-mix(in oklab, …)`), so a re-theme stays coherent:

- muted 5% (#EDF3E5)
- muted text 72% (#4D5C4A, 7.0:1 on Ivory)
- accent (selected or highlighted items): Lime cream at 45% on Ivory (#EBF9D1)

Lines (borders and input outlines) use a lighter Evergreen instead of grey: Evergreen and Green mixed 50/50, then into Ivory:

- border 20% (#CAD6C4), decorative only
- input outline 66% (#637E61): 4.4:1 on Ivory and 4.0:1 on the field fill, so it clears the 3:1 non-text minimum

Two fills are translucent so the page shows through:

- **surface** (glass): Ivory at 64% (`#FAFFF2A3`)
- **field** (inputs, selects, checkboxes, radios): white at 70% (`#FFFFFFB3`)

Every value can be overridden at runtime with a `--taqwa-color-*` custom property on any ancestor (`--taqwa-color-field` for the field fill).

### Contrast (WCAG AA)

The page is solid Ivory. Glass and field ratios are measured over `#B9E2A6`, the darkest colour an app may put behind the glass (a photo, illustration or gradient), which is the worst case; over Ivory they are higher.

| Pair | Ratio |
| --- | --- |
| Evergreen / Ivory | 15.65 |
| Muted text / Ivory | 7.02 |
| Evergreen / glass (worst) | 13.83 |
| Muted text / glass (worst) | 6.20 |
| Evergreen / dialog glass over the veil | 12.88 |
| Muted text / dialog glass over the veil | 5.77 |
| Green / glass (worst) | 6.58 |
| Ivory / Green (button) | 7.45 |
| Ivory / Green + 6% sheen (button top) | 6.42 |
| Evergreen / Lime cream | 13.04 |
| Ivory / Signal red | 6.47 |
| Signal red / glass (worst) | 5.71 |
| Amber / glass (worst) | 5.43 |
| Evergreen / field (worst) | 14.28 |
| Placeholder (muted) / field (worst) | 6.40 |
| Muted text / tabs track (worst) | 5.76 |
| Input outline / field (worst) | 4.03 (non-text) |
| Input outline / Ivory | 4.41 (non-text) |
| Focus ring (Green) / Ivory | 7.45 (non-text) |
| Green range / Lime cream track | 6.21 (non-text) |

## Typography

There are three typefaces, each with a strict role:

- **Inter:** all UI and body text. 15px / 24px on mobile and 14px / 20px from 768px up. Labels use weight 500.
- **Instrument Sans:** titles inside components (dialog, drawer, popover, toast titles, fieldset legends) and page headings. Weight 600 with slight negative tracking.
- **Instrument Serif:** display only, e.g. hero text and editorial moments. Never used for UI text, and no component uses it. It's available as `--taqwa-font-display`.

The package ships no font files. Load them in the app, for example from Google Fonts: `family=Inter:wght@400..700&family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1`. Override them with `--taqwa-font-body`, `--taqwa-font-heading` and `--taqwa-font-display`.

## Layout

- **Mobile first** and fluid. Components fill their container width on small screens. At the `md` breakpoint (768px) controls shrink from 44px to 40px tall and their horizontal padding goes from 16px to 14px.
- **Spacing** uses a 4px base with a relaxed rhythm:
  - 12–16px between related items inside a component
  - 24px padding inside dialogs, drawers, popovers and cards
  - 24px between form fields
  - 8px between a label and its control
- **Overlays on mobile** become sheets: drawers are full-width bottom sheets with snap points, and toasts sit bottom centre at full width minus 16px. On wider screens, toasts move to the bottom right (max 24rem) and side drawers are at most 26rem wide.

## Elevation & Depth

Depth comes from a real material, not from darkness.

- **Page level:** solid Ivory (`#FAFFF2`), with no gradient or grain. The package ships no page background; set it in your app (Storybook does in `.storybook/preview-head.html`). Anything placed behind the glass should stay at least as light as `#B9E2A6` so the contrast table holds.
- **Floating level (frosted glass):** `glass-surface`
  - Ivory at 64% (`--taqwa-color-surface`)
  - `backdrop-filter: blur(22px) saturate(160%)` (`--taqwa-glass-blur`, `--taqwa-glass-saturate`)
  - a white sheen fading out over the top 4rem (`--taqwa-glass-sheen`)
  - film grain: inline SVG `feTurbulence` noise at ~7% (`--taqwa-grain`; `none` turns it off). Never on buttons
  - shadow (`--taqwa-shadow-surface`): a 1px white inner top highlight, a faint white inner rim, a hairline edge (Evergreen 11%), and a wide drop tinted Green (0 24px 56px −16px at 30%) over a small Evergreen contact shadow
- **Raised parts** (tab indicator, switch and slider thumbs): solid Ivory with `--taqwa-shadow-raised` (inner highlight, hairline, small green-tinted drop).
- **Controls:** fields are white at 70% with the input outline. Tabs and toggle groups sit in a translucent track (muted at 60% with a hairline). Hover mixes 6% Evergreen into the resting fill and press 12%, over 0.2s ease-out.
- **Buttons:** primary and destructive sit almost flat: a 6% white top-to-bottom sheen, a faint white inner top highlight and a 1px contact shadow tinted with their own colour. Secondary has a faint white inner highlight and a Green inner hairline so it holds its edge on lime areas.
- **Popups:** fade in with a 2% scale over 0.18s.
- **Modal backdrop:** a light Evergreen veil (12%) with `blur(8px) saturate(1.5)`, so the page stays fresh behind the dialog.

All motion uses Motion (`motion`); CSS transitions are not used. Buttons scale to 0.98 while pressed (`bindGlassMotion`'s `pressScale`). With `prefers-reduced-motion`, every animation is instant, nothing scales, and only colour and opacity states change.

## Shapes

Corners are soft but precise:

- 6px on controls (buttons, inputs, list items, tabs); checkboxes use 4px so they never read as radios
- 10px on tab and toggle tracks (control radius + their 4px padding)
- 10px on floating surfaces (popovers, menus, dialogs, toasts, toolbars)
- fully round only for avatars, radio buttons, switch tracks and thumbs, slider thumbs, and progress bars

Bottom sheets round only their top corners.

## Components

All 37 Base UI components are available as `taqwa-*` custom elements.

- **Buttons:** primary (deep Green with sheen), secondary (Lime cream), tertiary (transparent with a faint Evergreen wash on hover), destructive (Red with sheen). All 44px tall on mobile and 40px from 768px.
- **Inputs:** a translucent white field with a clear 1px input-coloured outline. Focus shows a 2px Green ring offset by 2px. The invalid state uses a red outline with the message below in red.
- **Selection controls:** checked state is a Green fill with an Ivory icon. Pressed toggles and selected options use Lime cream.
- **Lists and menus:** 44px rows on mobile and 36–40px from 768px. Rows are transparent; the highlighted row gets the faint Evergreen wash.
- **Floating surfaces** (popover, menu, select, tooltip, preview card, toast, dialog, drawer, toolbar) all use the frosted glass material. The popover arrow uses the glass fill and draws only the half outside the popup.

## Do's and Don'ts

- Do keep the page solid Ivory. The glass reads as a calm card on it; it frosts visibly only over content such as a photo, illustration or gradient.
- Do use Green for the single most important action in a view. Use secondary or tertiary for everything else.
- Do pair Lime cream with Evergreen text only. Never put Ivory or Green text on Lime cream for body copy.
- Do keep 44px touch targets on mobile, even when the visual mark is smaller (checkbox 20px, slider thumb).
- Do reserve Instrument Serif for display moments. Don't use it inside controls.
- Don't stack glass on glass more than one level deep (a popup over a glass card is the limit), because the blur turns muddy.
- Don't put a non-modal dialog inside an element with `backdrop-filter`: that element becomes its containing block. Modal dialogs and popups live in the top layer and are fine.
- Don't put anything darker than `#B9E2A6` behind the glass, or the muted text on glass drops below AA.
- Don't add grain to buttons or small controls; it belongs to the page and to glass panes.
- Don't use red for anything other than errors and destructive actions.
- Don't mix rounded-full pills with 6px controls in the same group (except avatars and switches).
- Don't animate with CSS transitions. Use the shared Motion helpers so reduced motion is respected.
