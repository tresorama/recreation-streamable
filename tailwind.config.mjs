import plugin from 'tailwindcss/plugin';
import cssEscape from 'css.escape';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [
    // Expose theme as CSS variables
    plugin(({ addBase, theme }) => {

      /** @type {(obj:object, mapper: (item:[key:string,value:any]) => [string,unknown]) => {[k:string]:any}} */
      const mapObject = (obj, mapper) => {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => mapper([key, value]))
        );
      };

      /** @type {(obj:{[k:string]: string}) => {[k:string]:string}} */
      const escapeCssVariablesObject = (obj) => {
        return mapObject(
          obj,
          (([key, value]) => [cssEscape(key), value])
        );
      };

      /** 
       * @type {(
      * obj: {[k:string]: string},
      * group: string,
      * prefix: string,
      * ) => {[k:string]: string}} 
      * */
      function extractVars(obj, group = '', prefix) {
        return Object.keys(obj).reduce((vars, key) => {
          const value = obj[key];
          const cssVariable = key === "DEFAULT" ? `--${prefix}${group}` : `--${prefix}${group}-${key}`;
          const newVars =
            typeof value === 'string'
              ? { [cssVariable]: value }
              : extractVars(value, `-${key}`, prefix);
          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': escapeCssVariablesObject({
          ...extractVars(theme('colors'), '', 'color'),
          ...extractVars(theme('fontSize'), '', 'font-size'),
          ...extractVars(theme('spacing'), '', 'spacing'),
          ...extractVars(theme('borderRadius'), '', 'border-radius'),
          ...extractVars(theme('boxShadow'), '', 'box-shadow'),
        })
      });

    }),
    // Customize project framework
    plugin(({ addBase, addComponents, theme }) => {

      // sections
      addBase({
        ":root": {
          "--px-section": theme('spacing.8'),
          "--container--md--max-width": "1200px",// main container
          "--container--full--max-width": "2560px",// do not used this directly, it here to constrain screen when the screen size is really huge
        },
        [`@media (min-width: ${theme('screens.md')})`]: {
          ":root": {
            "--px-section": theme('spacing.20'),
          },
        }
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
        ".btn": { "@apply inline-flex justify-center rounded-md border-0 px-4 py-2 text-base": {} },
        ".btn--primary": { "@apply bg-blue-500 text-white hover:bg-blue-600": {} },
      });
    })
  ],
};
