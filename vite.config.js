import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from "path";
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
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
