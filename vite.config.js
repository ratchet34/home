import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactNativeWeb from "vite-plugin-react-native-web";
import { readFileSync } from "fs";
import * as esbuild from "esbuild";

const extensions = [
  ".mjs",
  ".web.tsx",
  ".tsx",
  ".web.ts",
  ".ts",
  ".web.jsx",
  ".jsx",
  ".web.js",
  ".js",
  ".css",
  ".json",
];

const rollupPlugin = (matchers) => ({
  name: "js-in-jsx",
  load(id) {
    if (matchers.some((matcher) => matcher.test(id)) && id.endsWith(".js")) {
      const file = readFileSync(id, { encoding: "utf-8" });
      return esbuild.transformSync(file, { loader: "jsx", jsx: "automatic" });
    }
  },
});

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: "window",
  },
  plugins: [react(), reactNativeWeb()],
  // assetsInclude: ['**/*.ttf'],
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.1.15:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      plugins: [rollupPlugin([/react-native-vector-icons/])],
    },
    sourcemap: true, // Enable source maps in the build
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
      jsx: "automatic",
      loader: { ".js": "jsx" },
    },
  },
});
