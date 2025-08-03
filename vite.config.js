// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, 'editor'),
  build: {
    outDir: path.resolve(__dirname, 'public'),
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'editor/index.html'),
        editor: path.resolve(__dirname, 'editor/editor.html'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});

