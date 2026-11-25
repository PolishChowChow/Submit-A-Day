
import { defaultConfig } from "@tamagui/config/v6";
import { createTamagui } from "tamagui";

/**
 * Tamagui configuration
 *
 * Inherits the v6 preset:
 * - Default tokens
 * - Default themes
 * - Default fonts
 * - Default shorthands
 * - Default sizing
 * - Default settings
 *
 * Extend the individual sections as your design system grows.
 */

export const config = createTamagui({
  ...defaultConfig,

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
