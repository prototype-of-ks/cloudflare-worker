import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './src/web/main.tsx',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
