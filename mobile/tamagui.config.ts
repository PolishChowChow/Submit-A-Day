import { defaultConfig } from "@tamagui/config/v6";
import { createTamagui } from "tamagui";

/**
 * Tamagui configuration: the v6 preset plus the app's blue palette.
 *
 * Colors follow the 60 / 30 / 10 rule:
 * - 60% dominant:  `background`: the screen itself, a near-white / deep navy neutral.
 * - 30% secondary: `surface` (cards, header, tab bar, calendar), with `border-color`.
 *                  A soft blue tint that groups content without shouting.
 * - 10% accent:    `primary` (+ `primary-color` for text on it): the main button, checked
 *                  boxes, active tab, submitted calendar days. Use it sparingly.
 * Plus status colors: `success` / `success-muted` (progress bar), `danger` (errors), `streak`.
 *
 * Use these theme keys in components (`backgroundColor="surface"`), never raw hex values,
 * so light and dark mode both work.
 */
const palette = {
  light: {
    background: "#f7f9fc",
    "background-hover": "#ffffff",
    "background-press": "#e8eef8",
    surface: "#e8f0fe",
    "surface-press": "#d6e4fd",
    "border-color": "#c9daf8",
    color: "#0f1b33",
    "placeholder-color": "#5f6f8c",
    primary: "#1d5ff5",
    "primary-press": "#164bc4",
    "primary-color": "#ffffff",
    success: "#16a34a",
    "success-muted": "#d3f3df",
    danger: "#dc2626",
    streak: "#f97316",
  },
  dark: {
    background: "#0b1220",
    "background-hover": "#111a2e",
    "background-press": "#16213a",
    surface: "#14213d",
    "surface-press": "#1b2b4f",
    "border-color": "#24365e",
    color: "#e6edf9",
    "placeholder-color": "#8a9bbd",
    primary: "#4c8dff",
    "primary-press": "#3a74e0",
    "primary-color": "#06101f",
    success: "#22c55e",
    "success-muted": "#123a24",
    danger: "#f87171",
    streak: "#fb923c",
  },
} as const;

/**
 * Add the palette to every theme. The base `light` / `dark` themes (and their nested
 * `_levelN` variants) also take over the neutral colors; component sub-themes such as
 * `light_accent` keep their own backgrounds and only gain the new keys.
 */
const BASE_THEME = /^(light|dark)(_level\d)*$/;
type PaletteKey = keyof typeof palette.light;
type Themes = typeof defaultConfig.themes;

const themes = Object.fromEntries(
  Object.entries(defaultConfig.themes).map(([name, theme]) => {
    const colors = name.startsWith("dark") ? palette.dark : palette.light;
    const merged = BASE_THEME.test(name) ? { ...theme, ...colors } : { ...colors, ...theme };
    return [name, merged];
  })
) as { [Name in keyof Themes]: Themes[Name] & Record<PaletteKey, string> };

export const config = createTamagui({
  ...defaultConfig,
  themes,

  // Responsive breakpoints
  media: {
    ...defaultConfig.media,

    // Custom breakpoints go here
    // tablet: { minWidth: 768 },
    // desktop: { minWidth: 1024 },
  },
  settings: {
    ...defaultConfig.settings,
    // The v6 preset only accepts shorthands (`p`, `items`, `text`...). Allow the
    // full names too (`padding`, `alignItems`, `textAlign`), which read better.
    onlyAllowShorthands: false,
  },
});

export type AppTamaguiConfig = typeof config;

/**
 * Enables Tamagui-aware type checking globally.
 * Style props, tokens, themes, etc. are inferred from this configuration.
 */
declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default config;
