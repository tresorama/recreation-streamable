import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addBase, addComponents, theme }) => {
      // sections
      addBase({
        ":root": {
          "--px-section": theme('spacing.20'),
          "--container--md--max-width": "1200px",// main container
          "--container--full--max-width": "2560px",// do not used this directly, it here to constrain screen when the screen size is really huge
        },
      });
      addComponents({
        ".section": {
          display: "grid",
          gridTemplateColumns: "var(--px-section) minmax(0,var(--container--md--max-width)) var(--px-section)",
          justifyContent: "space-between",
          "& > *": {
            gridColumn: "2/-2",
          },
        },
        ".section__item--fw": {
          gridColumn: "1/-1",
        }
      });
      addComponents({
        ".btn": { "@apply rounded-md border-0 px-4 py-2 text-base": {} },
        ".btn--primary": { "@apply bg-blue-500 text-white hover:bg-blue-600": {} },
      });
    })
  ],
};
