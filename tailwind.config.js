// tailwind.config.js
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          success: 'var(--color-success)',
          error: 'var(--color-error)',
          warning: 'var(--color-warning)',
          info: 'var(--color-info)',
          muted: 'var(--color-muted)',
          light: 'var(--color-light)',
          dark: 'var(--color-dark)',
          background: 'var(--color-background)',
          foreground: 'var(--color-foreground)',
        },
      },
    },
    plugins: [],
  };
  