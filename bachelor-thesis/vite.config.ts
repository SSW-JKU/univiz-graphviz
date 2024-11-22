import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			preprocess: {
				style: async ({ content, attributes }) => {
					if (attributes.lang === "scss") {
						const sass = await import("sass"); // Use dynamic import
						const { css } = sass.compileString(content); // Compile SCSS
						return { code: css };
					}
					return { code: content }; // Fallback for non-SCSS styles
				},
			},
		}),
	],
	build: { chunkSizeWarningLimit: 5000 },
	optimizeDeps: {
		include: [
			"@codemirror/state",
			"@codemirror/view",
			"@codemirror/basic-setup",
			"@codemirror/lang-javascript",
		],
	},
});
