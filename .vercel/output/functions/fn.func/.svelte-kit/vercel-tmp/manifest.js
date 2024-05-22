export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.BWmYJMdi.js","app":"_app/immutable/entry/app.CO4o9Kb6.js","imports":["_app/immutable/entry/start.BWmYJMdi.js","_app/immutable/chunks/entry.CHAc2tEn.js","_app/immutable/chunks/scheduler.u2sAWruA.js","_app/immutable/chunks/index.Ddwg8BFW.js","_app/immutable/entry/app.CO4o9Kb6.js","_app/immutable/chunks/scheduler.u2sAWruA.js","_app/immutable/chunks/index.cogxvB92.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/createNewItem",
				pattern: /^\/api\/createNewItem\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/createNewItem/_server.ts.js'))
			},
			{
				id: "/api/getRecipeBook",
				pattern: /^\/api\/getRecipeBook\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/getRecipeBook/_server.ts.js'))
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
