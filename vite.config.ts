import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ustudio/facade': path.resolve(__dirname, './src/core/facade.ts'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://digit-ustudio-test01.bwton-console.cn/dt-ustudio-service',
        changeOrigin: true,
        secure: false,
      },
      '/nfs': {
        target: 'https://digit-ustudio-test01.bwton-console.cn',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
