const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // esponi funzioni sicure qui
});
