import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // '/api': {
      //   target: 'http://atask.plea.kr',
      //   changeOrigin: true,
      // },
    },
  },
  assetsInclude: ['**/*.TTF', '**/*.otf'],
});
