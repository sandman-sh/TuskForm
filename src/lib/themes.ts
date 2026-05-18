// ─── TuskForm Theme Engine ─────────────────────────────────
// Provides theme presets and CSS generation for form backgrounds.
// ────────────────────────────────────────────────────────────

import type { ThemePreset, FormTheme } from '../store/store';

export interface ThemeConfig {
  label: string;
  preview: string; // CSS gradient for the preview swatch
  bgColor: string;
  accentColor: string;
  textColor: string;
  cardBg: string;
  bgCSS: string; // Full CSS background for the page
  animClass: string; // CSS animation class to add
}

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  clean: {
    label: 'Clean White',
    preview: 'linear-gradient(135deg, #f8f8f5, #fff)',
    bgColor: '#f4f4f0',
    accentColor: '#9d4edd',
    textColor: '#101010',
    cardBg: '#ffffff',
    bgCSS: `
      background-color: #f4f4f0;
      background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 24px 24px;
    `,
    animClass: '',
  },
  midnight: {
    label: 'Midnight Purple',
    preview: 'linear-gradient(135deg, #1a0533, #3c096c, #5a189a)',
    bgColor: '#1a0533',
    accentColor: '#c77dff',
    textColor: '#f0e6ff',
    cardBg: 'rgba(255,255,255,0.06)',
    bgCSS: `
      background: linear-gradient(135deg, #1a0533 0%, #3c096c 50%, #240046 100%);
      background-size: 400% 400%;
    `,
    animClass: 'theme-animate-gradient',
  },
  ocean: {
    label: 'Ocean Wave',
    preview: 'linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef)',
    bgColor: '#023e8a',
    accentColor: '#00f5d4',
    textColor: '#caf0f8',
    cardBg: 'rgba(255,255,255,0.08)',
    bgCSS: `
      background: linear-gradient(135deg, #023e8a 0%, #0077b6 30%, #0096c7 60%, #00b4d8 100%);
      background-size: 400% 400%;
    `,
    animClass: 'theme-animate-gradient',
  },
  sunset: {
    label: 'Sunset Glow',
    preview: 'linear-gradient(135deg, #ff6b6b, #ee5a24, #f9ca24)',
    bgColor: '#1a0a00',
    accentColor: '#f9ca24',
    textColor: '#fff5e6',
    cardBg: 'rgba(255,255,255,0.08)',
    bgCSS: `
      background: linear-gradient(135deg, #2d1b00 0%, #5c2e00 25%, #a83218 50%, #e6552d 75%, #f9a825 100%);
      background-size: 400% 400%;
    `,
    animClass: 'theme-animate-gradient',
  },
  aurora: {
    label: 'Aurora Borealis',
    preview: 'linear-gradient(135deg, #0d1b2a, #1b4332, #2d6a4f, #52b788, #95d5b2)',
    bgColor: '#0d1b2a',
    accentColor: '#52b788',
    textColor: '#d8f3dc',
    cardBg: 'rgba(255,255,255,0.05)',
    bgCSS: `
      background: linear-gradient(135deg, #0d1b2a 0%, #1b4332 25%, #2d6a4f 50%, #1b4332 75%, #0d1b2a 100%);
      background-size: 600% 600%;
    `,
    animClass: 'theme-animate-aurora',
  },
  neon: {
    label: 'Neon Cyber',
    preview: 'linear-gradient(135deg, #0a0a0a, #1a002e, #ff00ff, #00ffff)',
    bgColor: '#0a0a0a',
    accentColor: '#ff00ff',
    textColor: '#e0e0e0',
    cardBg: 'rgba(255,255,255,0.04)',
    bgCSS: `
      background-color: #0a0a0a;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(255,0,255,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, rgba(0,255,255,0.10) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(120,0,255,0.08) 0%, transparent 40%);
    `,
    animClass: 'theme-animate-neon',
  },
  forest: {
    label: 'Forest Moss',
    preview: 'linear-gradient(135deg, #1b4332, #2d6a4f, #40916c, #95d5b2)',
    bgColor: '#1b4332',
    accentColor: '#95d5b2',
    textColor: '#d8f3dc',
    cardBg: 'rgba(255,255,255,0.07)',
    bgCSS: `
      background: linear-gradient(160deg, #1b4332 0%, #2d6a4f 40%, #40916c 70%, #2d6a4f 100%);
      background-size: 300% 300%;
    `,
    animClass: 'theme-animate-gradient',
  },
  lavender: {
    label: 'Lavender Dream',
    preview: 'linear-gradient(135deg, #e6e6fa, #d8b4fe, #c084fc)',
    bgColor: '#f3e8ff',
    accentColor: '#7c3aed',
    textColor: '#2e1065',
    cardBg: 'rgba(255,255,255,0.85)',
    bgCSS: `
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #ddd6fe 60%, #ede9fe 100%);
      background-size: 400% 400%;
    `,
    animClass: 'theme-animate-gradient-slow',
  },
  custom: {
    label: 'Custom',
    preview: 'linear-gradient(135deg, #ddd, #fff)',
    bgColor: '#ffffff',
    accentColor: '#9d4edd',
    textColor: '#101010',
    cardBg: '#ffffff',
    bgCSS: 'background-color: #ffffff;',
    animClass: '',
  },
};

/**
 * Generate inline styles for a themed form page.
 */
export function getThemeStyles(theme: FormTheme | undefined): React.CSSProperties {
  if (!theme) return {};

  const preset = THEME_PRESETS[theme.preset] || THEME_PRESETS.clean;
  const bgColor = theme.bgColor || preset.bgColor;
  const textColor = theme.textColor || preset.textColor;

  const styles: React.CSSProperties = {
    minHeight: '100vh',
    color: textColor,
    transition: 'background 0.5s ease, color 0.3s ease',
  };

  if (theme.bgImage) {
    styles.backgroundImage = `url(${theme.bgImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
    styles.backgroundRepeat = 'no-repeat';
    styles.backgroundAttachment = 'fixed';
  } else if (theme.preset !== 'custom') {
    // Apply preset bg via CSS class (handled in index.css)
  } else {
    styles.backgroundColor = bgColor;
  }

  return styles;
}

/**
 * Get card styles for a themed form.
 */
export function getCardStyles(theme: FormTheme | undefined): React.CSSProperties {
  if (!theme) return {};
  const preset = THEME_PRESETS[theme.preset] || THEME_PRESETS.clean;
  const cardBg = theme.cardBg || preset.cardBg;
  const textColor = theme.textColor || preset.textColor;
  const isDark = ['midnight', 'ocean', 'sunset', 'aurora', 'neon', 'forest'].includes(theme.preset);

  return {
    background: cardBg,
    color: textColor,
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#000',
    boxShadow: isDark ? '4px 4px 0px rgba(255,255,255,0.1)' : '4px 4px 0px #000',
  };
}

/**
 * Get accent-colored styles for a themed form.
 */
export function getAccentStyles(theme: FormTheme | undefined): React.CSSProperties {
  if (!theme) return {};
  const preset = THEME_PRESETS[theme.preset] || THEME_PRESETS.clean;
  return { color: theme.accentColor || preset.accentColor };
}
