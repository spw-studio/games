/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--theme-background)',
        foreground: 'var(--theme-foreground)',
        surface: 'var(--theme-surface)',
        'surface-hover': 'var(--theme-surfaceHover)',
        primary: 'var(--theme-primary)',
        'primary-foreground': 'var(--theme-primaryForeground)',
        secondary: 'var(--theme-secondary)',
        'secondary-foreground': 'var(--theme-secondaryForeground)',
        border: 'var(--theme-border)',
        muted: 'var(--theme-muted)',
        'muted-foreground': 'var(--theme-mutedForeground)',
        success: 'var(--theme-success)',
        warning: 'var(--theme-warning)',
        danger: 'var(--theme-danger)',
        brand: {
          50: '#FAF5F5',
          100: '#F3E8E8',
          200: '#E5CDCD',
          300: '#D1ABAB',
          400: '#B37574',
          500: '#8E3935',
          600: '#6D1C19',
          700: '#571412',
          800: '#44100D', // Cor predominante solicitada
          900: '#330B09',
          950: '#1F0605',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF3E8',
          200: '#F3E3C8',
          300: '#E8CEA0',
          400: '#DBB674',
          500: '#C89D5C',
          600: '#AD813E',
          700: '#876228',
          800: '#67481C',
          900: '#4F3514',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F3',
          200: '#F4EFE6',
          300: '#EAE1D3',
          400: '#DDD0BE',
          500: '#CBBBA6',
        }
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
