import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: 'es6',
		lib: {
			entry: 'src/main.ts',
			name: 'LibAVWebCodecs',
			fileName: format => format === 'umd'
				? 'libav-webcodecs-polyfill.umd.js'
				: 'libav-webcodecs-polyfill.js',
		},
		sourcemap: true,
		rollupOptions: {
			external: /libav\.js/,
		},
	},
});
