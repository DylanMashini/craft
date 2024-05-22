

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.CObPRohP.js","_app/immutable/chunks/scheduler.u2sAWruA.js","_app/immutable/chunks/index.cogxvB92.js"];
export const stylesheets = ["_app/immutable/assets/0.Qo3-hvJ3.css"];
export const fonts = [];
