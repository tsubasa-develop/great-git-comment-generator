
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from "path";
import imagemin from 'vite-plugin-imagemin';

const __unconfig_default =  defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib"),
			$components: path.resolve("./src/components"),
			$layouts: path.resolve("./src/layouts"),
		}
	},
	plugins: [sveltekit(), imagemin({
		filter: /noise\.png/,
	})]
});

if (typeof __unconfig_default === "function") __unconfig_default(...[{"command":"serve","mode":"development"}]);export default __unconfig_data;