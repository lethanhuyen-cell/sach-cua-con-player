import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['var(--font-be-vietnam)', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
