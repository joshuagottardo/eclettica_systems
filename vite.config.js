// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import { arch } from 'os';

export default defineConfig({
  root: path.resolve(__dirname, 'renderer'),
  publicDir: path.resolve(__dirname, 'renderer/public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // pagine root
        index: path.resolve(__dirname, 'renderer/index.html'),
        aree:  path.resolve(__dirname, 'renderer/aree.html'),
        menu:  path.resolve(__dirname, 'renderer/menu.html'),
        // ceppi
        ceppi_ricerca:     path.resolve(__dirname, 'renderer/ceppi/ricerca.html'),
        ceppi_inserimento: path.resolve(__dirname, 'renderer/ceppi/inserimento.html'),
        ceppi_dettagli:    path.resolve(__dirname, 'renderer/ceppi/dettagli.html'),
        // aziende
        aziende_ricerca:   path.resolve(__dirname, 'renderer/aziende/ricerca.html'),
        aziende_inserimento: path.resolve(__dirname, 'renderer/aziende/inserimento.html'),
        // persone
        persone_ricerca:   path.resolve(__dirname, 'renderer/persone/ricerca.html'),
        persone_inserimento: path.resolve(__dirname, 'renderer/persone/inserimento.html'),
        // archivio disegni
        archivio_disegni_ricerca: path.resolve(__dirname, 'renderer/archivio_disegni/ricerca.html'),
        archivio_disegni_inserimento: path.resolve(__dirname, 'renderer/archivio_disegni/inserimento.html'),
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.ststudiomilano.it',
        changeOrigin: true,
        secure: true,
        rewrite: p => p.replace(/^\/api/, '/api')
      }
    }
  }
});
