/** @type {import('tailwindcss').Config} */

// Helper: converte um token de tema em cor com suporte a opacidade.
// Os tokens são expostos como canais RGB ("R G B") pelo ThemeProvider.
const themeColor = (token) => `rgb(var(--theme-${token}) / <alpha-value>)`;

// Helper: monta uma rampa inteira (ex: brand.500 -> --theme-brand-500)
const ramp = (name, shades) =>
  shades.reduce((acc, shade) => {
    acc[shade] = themeColor(`${name}-${shade}`);
    return acc;
  }, {});

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ---- Tokens semânticos ----
        background: themeColor('background'),
        foreground: themeColor('foreground'),
        surface: themeColor('surface'),
        'surface-hover': themeColor('surfaceHover'),
        'surface-elevated': themeColor('surfaceElevated'),
        muted: themeColor('muted'),
        'muted-foreground': themeColor('mutedForeground'),
        'subtle-foreground': themeColor('subtleForeground'),
        border: themeColor('border'),
        'border-strong': themeColor('borderStrong'),

        primary: themeColor('primary'),
        'primary-foreground': themeColor('primaryForeground'),
        'primary-soft': themeColor('primarySoft'),
        'primary-soft-foreground': themeColor('primarySoftForeground'),

        secondary: themeColor('secondary'),
        'secondary-foreground': themeColor('secondaryForeground'),
        'secondary-soft': themeColor('secondarySoft'),
        'secondary-soft-foreground': themeColor('secondarySoftForeground'),

        success: themeColor('success'),
        'success-foreground': themeColor('successForeground'),
        'success-soft': themeColor('successSoft'),
        'success-soft-foreground': themeColor('successSoftForeground'),

        warning: themeColor('warning'),
        'warning-foreground': themeColor('warningForeground'),
        'warning-soft': themeColor('warningSoft'),
        'warning-soft-foreground': themeColor('warningSoftForeground'),

        danger: themeColor('danger'),
        'danger-foreground': themeColor('dangerForeground'),
        'danger-soft': themeColor('dangerSoft'),
        'danger-soft-foreground': themeColor('dangerSoftForeground'),

        info: themeColor('info'),
        'info-foreground': themeColor('infoForeground'),
        'info-soft': themeColor('infoSoft'),
        'info-soft-foreground': themeColor('infoSoftForeground'),

        // Superfícies "hero"
        'hero-from': themeColor('heroFrom'),
        'hero-via': themeColor('heroVia'),
        'hero-to': themeColor('heroTo'),
        'hero-foreground': themeColor('heroForeground'),
        overlay: themeColor('overlay'),

        // Branco/preto controlados pelo tema
        white: themeColor('white'),
        black: themeColor('black'),

        // ---- Rampas completas ----
        brand: ramp('brand', [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950]),
        gold: ramp('gold', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        cream: ramp('cream', [50, 100, 200, 300, 400, 500]),
        gray: ramp('gray', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        emerald: ramp('emerald', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        amber: ramp('amber', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        rose: ramp('rose', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        red: ramp('red', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        sky: ramp('sky', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
      },
      borderRadius: {
        card: 'var(--theme-radiusCard)',
        control: 'var(--theme-radiusControl)',
      },
      boxShadow: {
        card: 'var(--theme-shadowCard)',
        elevated: 'var(--theme-shadowElevated)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};