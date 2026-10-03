/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0a0e14',
          surface: '#111720',
          card: '#161d28',
          border: '#1e2836',
          'border-hover': '#2a3849',
          muted: '#5c6f82',
          text: '#c5d0dc',
          'text-bright': '#e8eef5',
          'text-dim': '#7a8a9c',
        },
        accent: {
          cyan: '#00d4ff',
          'cyan-dim': '#0098b8',
          amber: '#f5a623',
          'amber-dim': '#c4861a',
          red: '#ff4757',
          'red-dim': '#cc3645',
          green: '#26de81',
          'green-dim': '#1bb866',
          blue: '#3b82f6',
        },
        severity: {
          critical: '#ff4757',
          high: '#f5a623',
          medium: '#ffd93d',
          low: '#26de81',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scan-line': 'scanLine 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ticker': 'ticker 0.6s ease-out',
        'threat-flash': 'threatFlash 0.5s ease-out',
        'count-up': 'countUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        threatFlash: {
          '0%': { backgroundColor: 'rgba(255, 71, 87, 0.15)' },
          '100%': { backgroundColor: 'transparent' },
        },
        countUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'soc': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
