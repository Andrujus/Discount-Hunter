export const palette = {
  primary: '#0705F6',
  secondary: '#110792',
  accent: '#FCB4D4',
  accentDark: '#B079C2',
} as const;

export const tones = {
  background: 'rgba(252, 180, 212, 0.15)',
  surface: '#FFFFFF',
  softAccent: 'rgba(252, 180, 212, 0.3)',
  subduedBorder: 'rgba(176, 121, 194, 0.4)',
  primaryShadow: 'rgba(7, 5, 246, 0.25)',
  accentShadow: 'rgba(176, 121, 194, 0.35)',
  mutedText: palette.accentDark,
  inverseText: '#FFFFFF',
} as const;

export type PaletteColor = keyof typeof palette;

