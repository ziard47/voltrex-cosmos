/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}', './*.html'],
  // Prevent Tailwind preflight from stripping MUI component default styling
  corePlugins: {
    preflight: false,
  },
  // Ensure Tailwind utilities can predictably override MUI CSS specificity
  important: '#root',
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: '#080c16',
          surface: '#0f172a',
          card: '#131f37',
          cardHover: '#182745',
          border: '#1e293b',
          borderSubtle: '#26354a',
          indigo: '#6366f1',
          indigoDeep: '#4338ca',
          cyan: '#06b6d4',
          cyanBright: '#22d3ee',
          violet: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          textPrimary: '#f8fafc',
          textSecondary: '#94a3b8',
          textMuted: '#64748b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'shield-glow': '0 0 24px -4px rgba(6, 182, 212, 0.25)',
        'threat-glow': '0 0 28px -4px rgba(239, 68, 68, 0.35)',
        'warning-glow': '0 0 28px -4px rgba(245, 158, 11, 0.3)',
      },
    },
  },
  plugins: [],
}
