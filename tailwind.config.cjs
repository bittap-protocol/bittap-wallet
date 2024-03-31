/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        "primary": "#1990FF",
        "secondary": "#00af00",         
        "accent": "#fcd34d",         
        "neutral": "#1990ff",         
        "base-100": "#f3f4f6",         
        "info": "#00b4ff",         
        "success": "#22c55e",         
        "warning": "#e86b00",         
        "error": "#d10029",
      },
      animation: {
        'fade-in': 'fadein 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'fade-out': 'fadeout 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'slide-up': 'slideup 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite ',
        'slide-down': 'slidedown 1s cubic-bezier(0.19, 1, 0.22, 1) 0 1 normal forwards infinite '
      },
      keyframes: {
        fadein: {
          '0%': { backgroundColor: 'rgba(0,0,0,0)' },
          '100%': { backgroundColor: 'rgba(0,0,0,0.6)' }
        },
        fadeout: {
          '0%': { backgroundColor: 'rgba(0,0,0,0.6)' },
          '100%': { backgroundColor: 'rgba(0,0,0,0)' }
        },
        slideup: {
          '0%': { top: '100%' },
          '100%': { top: '20%' }
        },
        slidedown: {
          '0%': { top: '20%' },
          '100%': { top: '100%' }
        }
      }
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#1990FF",
          "secondary": "#00af00",         
          "accent": "#fcd34d",         
          "neutral": "#1990ff",         
          "base-100": "#f3f4f6",         
          "info": "#00b4ff",         
          "success": "#22c55e",         
          "warning": "#e86b00",         
          "error": "#d10029",
          "--rounded-btn": "2px",
          ".btn-primary": {
            "color": "#ffffff",
          }
        },
      },
    ],
  },
  plugins: [
    'prettier-plugin-tailwindcss',
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('daisyui'),
  ],
}
