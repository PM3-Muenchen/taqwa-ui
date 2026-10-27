---
"@pm3munchen/taqwa-ui": patch
---

Buttons use a smaller label: 14px on mobile and 13px from 768px. Their height now comes from padding instead of a minimum height (9px × 14px on mobile, 8px × 12px from 768px, so 38px and 34px tall), and it follows `--taqwa-padding-scale`.

Button-like controls share that sizing: `taqwa-toggle`, `taqwa-tab`, the `taqwa-collapsible` trigger, `taqwa-navigation-menu-link` and the toast action. The dialog and toast close buttons are square with the same vertical padding (34px on mobile, 32px from 768px). The collapsible trigger's border is now an inset hairline, so it adds no height.

Icons slotted into `taqwa-button` and `taqwa-toggle` are 16px. When a button or toggle holds only an icon, it gets `data-icon-only` and is square: 34px on mobile, 32px from 768px.

Every field matches the button height (38px on mobile, 34px from 768px): `taqwa-input`, the `taqwa-select` trigger, `taqwa-combobox`, `taqwa-autocomplete`, `taqwa-number-field` and `taqwa-otp-field`. They use the button padding minus their 1px border and 14px / 13px text, which is 16px on touch devices. Number field steppers and OTP cells are squares of that height.
