const path = require("path");
const { app, BrowserWindow } = require("electron");
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
  });

const port = process.env.PORT || 5173;

const startUrl = process.env.ELECTRON_DEV
  ? `http://localhost:${port}`
  : `file://${path.join(__dirname, '../build/index.html')}`;

  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
