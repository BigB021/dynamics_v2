const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getBackendURL: () => ipcRenderer.invoke("get-backend-url"),
});
