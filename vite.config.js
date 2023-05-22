import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: 'es6',
		lib: {
			entry: 'src/main.ts',
			name: 'LibAVWebCodecs',
			fileName: 'libav-webcodecs-polyfill',
		},
		sourcemap: true,
		rollupOptions: {
			external: /libav\.js/,
		},
	},
});
