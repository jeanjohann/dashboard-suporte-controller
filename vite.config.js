/** Separa bibliotecas de gráficos e planilhas sem misturar React ao carregamento tardio dos relatórios. */
import { defineConfig } from 'vite';

export default defineConfig({
  worker: { format: 'es' },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replaceAll('\\', '/');
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return 'react';
          if (/\/node_modules\/xlsx\//.test(path)) return 'spreadsheets';
          if (/\/node_modules\/recharts\//.test(path)) return 'charts';
        },
      },
    },
  },
});
