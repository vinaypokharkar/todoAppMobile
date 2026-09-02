/**
 * Design tokens. Nothing in the app hardcodes a colour, radius or spacing
 * value — everything reads from here. That is what makes the dark theme a
 * single object swap rather than a rewrite.
 *
 * light = "Terracotta Dusk"  (design-mockups.html, Direction 05)
 * dark  = "Aurora Glass"     (design-mockups.html, Direction 01)
 */

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 12, lg: 16, xl: 22, pill: 999 } as const;

export const typography = {
  display: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  title:   { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  heading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  body:    { fontSize: 15, fontWeight: '500' },
  label:   { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  overline:{ fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
} as const;

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderSoft: string;
    text: string;
    textMuted: string;
    textFaint: string;
    primary: string;
    onPrimary: string;
    accent: string;
    onAccent: string;
    warm: string;
    onWarm: string;
    success: string;
    onSuccess: string;
    danger: string;
    dangerSoft: string;
    overlay: string;
    priority: { urgent: string; high: string; medium: string; low: string };
    /** Two stops for the FAB and primary CTA gradient. */
    gradient: [string, string];
  };
  shadow: {
    card: object;
    fab: object;
  };
}

/** Terracotta Dusk — eggshell ground, twilight-indigo ink, burnt-peach accent. */
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    bg: '#F4F1DE',
    surface: '#FFFFFF',
    surfaceAlt: '#FAF8EF',
    border: '#E4DEC4',
    borderSoft: '#E9E4CE',
    text: '#3D405B',
    textMuted: '#6D7089',
    textFaint: '#9498AD',
    primary: '#3D405B',
    onPrimary: '#F4F1DE',
    accent: '#E07A5F',
    onAccent: '#FFFFFF',
    warm: '#F2CC8F',
    onWarm: '#5C4420',
    success: '#81B29A',
    onSuccess: '#3D405B',
    danger: '#C15A3F',
    dangerSoft: '#FBE9E4',
    overlay: 'rgba(61,64,91,0.35)',
    priority: { urgent: '#E07A5F', high: '#C9932E', medium: '#81B29A', low: '#9498AD' },
    gradient: ['#E07A5F', '#C9932E'],
  },
  shadow: {
    card: { shadowColor: '#3D405B', shadowOpacity: 0.07, shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    fab:  { shadowColor: '#E07A5F', shadowOpacity: 0.45, shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  },
};

/** Aurora Glass — dark slate, frosted surfaces, indigo→cyan gradient. */
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    bg: '#0B0F1A',
    surface: 'rgba(255,255,255,0.06)',
    surfaceAlt: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.10)',
    borderSoft: 'rgba(255,255,255,0.07)',
    text: '#EEF2FF',
    textMuted: '#9FA8C7',
    textFaint: '#7C88A8',
    primary: '#6C5CE7',
    onPrimary: '#08101F',
    accent: '#00D2FF',
    onAccent: '#08101F',
    warm: '#FFA23E',
    onWarm: '#08101F',
    success: '#3ED598',
    onSuccess: '#08101F',
    danger: '#FF4D6D',
    dangerSoft: 'rgba(255,77,109,0.14)',
    overlay: 'rgba(4,6,12,0.6)',
    priority: { urgent: '#FF4D6D', high: '#FFA23E', medium: '#4CC9F0', low: '#7C88A8' },
    gradient: ['#6C5CE7', '#00D2FF'],
  },
  shadow: {
    card: { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    fab:  { shadowColor: '#6C5CE7', shadowOpacity: 0.7, shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  },
};
