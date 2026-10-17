import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('scadaBridge', {
  platform: process.platform,
  version: process.versions.electron,
  isElectron: true,
  exportReport: (filename: string, content: string) => {
    return ipcRenderer.invoke('export-report', { filename, content });
  },
  onDiscoveryUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('discovery-update', (_event, data) => callback(data));
  }
});
