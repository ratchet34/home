import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactNativeWeb from "vite-plugin-react-native-web";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reactNativeWeb()],
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
    sourcemap: true, // Enable source maps in the build
  },
});
