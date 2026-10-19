const { createTailwindConfig } = require('@cci/admin-theme');

/** @type {import('tailwindcss').Config} */
module.exports = createTailwindConfig({
  namespace: 'cci-nm',
  safelistMode: 'shared-ui',
  content: ['./src/admin-v2/**/*.{js,jsx}'],
  safelist: ['tw-hidden'],
});
