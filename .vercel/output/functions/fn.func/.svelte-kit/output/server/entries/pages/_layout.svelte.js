import { c as create_ssr_component } from "../../chunks/ssr.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-13dvji7_START --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- HEAD_svelte-13dvji7_END -->`, ""} ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
