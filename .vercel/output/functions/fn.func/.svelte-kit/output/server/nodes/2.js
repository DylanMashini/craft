

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.D0F7BFtj.js","_app/immutable/chunks/scheduler.u2sAWruA.js","_app/immutable/chunks/index.cogxvB92.js","_app/immutable/chunks/index.Ddwg8BFW.js"];
export const stylesheets = ["_app/immutable/assets/2.5G1ytw73.css"];
export const fonts = [];
