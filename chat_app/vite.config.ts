import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// OPTIMIZED Vite configuration for text-only chat app
// Key optimizations:
// 1. Manual chunks for better code splitting
// 2. Optimized vendor chunking strategy
// 3. Reduced chunk size warnings threshold
// 4. CSS code splitting enabled

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Rollup options for better chunking
    rollupOptions: {
      output: {
        // Manual chunks strategy for optimal loading
        manualChunks: {
          // Vendor libraries that rarely change
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          // State management
          'vendor-state': ['recoil'],
          // Markdown rendering (heavy libraries)
          'vendor-markdown': [
            'react-markdown',
            'remark-gfm',
            'remark-directive',
            'rehype-katex',
            'rehype-raw',
            'remark-math',
          ],
          // Chainlit client
          'vendor-chainlit': ['@chainlit/react-client'],
        },
        // Optimize chunk file naming
        chunkFileNames: (chunkInfo) => {
          const info = chunkInfo.name;
          if (info?.startsWith('vendor-')) {
            return 'assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // Optimize asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          if (info.endsWith('.css')) {
            return 'assets/styles/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Use esbuild minification (default, faster than terser)
    // Removed terser to avoid extra dependency - esbuild is built-in
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
  plugins: [react(), tsconfigPaths(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "usehooks-ts": path.resolve(__dirname, "./node_modules/usehooks-ts"),
      sonner: path.resolve(__dirname, "./node_modules/sonner"),
      lodash: path.resolve(__dirname, "./node_modules/lodash"),
      recoil: path.resolve(__dirname, "./node_modules/recoil"),
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recoil',
      '@chainlit/react-client',
      'react-dropzone', // Include since useUpload.tsx still imports it
    ],
    exclude: [
      // Excluded media libraries for text-only chat
      'react-player',
      'react-plotly.js',
      'plotly.js',
      'react-file-icon',
    ],
  },
});
