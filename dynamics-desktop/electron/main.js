const path = require("path");
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const { ipcMain } = require("electron");

require("dotenv").config();
require('dotenv').config({
  path: path.join(__dirname, process.env.ELECTRON_DEV ? '.env.development' : '.env.production'),
});

let serverProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), 
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  const port = process.env.PORT || 5173;

  const startUrl = process.env.ELECTRON_DEV
    ? `http://localhost:${port}`
    : `file://${path.join(process.resourcesPath, "build", "index.html")}`;

  console.log(`🧭 Loading frontend from: ${startUrl}`);

  win.loadURL(startUrl);

  //win.webContents.openDevTools();

  win.webContents.on("did-fail-load", (event, errorCode, errorDesc, validatedURL) => {
    console.error(`❌ Failed to load: ${validatedURL}\nCode: ${errorCode}\nDesc: ${errorDesc}`);
  });

  win.webContents.on("did-finish-load", () => {
    console.log("✅ Frontend loaded successfully");
  });
}

function startBackend() {
  const isProd = !process.env.ELECTRON_DEV;
  const serverBase = isProd
    ? path.join(process.resourcesPath, "music-server")
    : path.join(__dirname, "../music-server");

  const serverPath = path.join(serverBase, "server.js");

  console.log(`[🔁] Starting backend from: ${serverPath}`);
  console.log(`[🌐] Backend environment: ${isProd ? "production" : "development"}`);

  serverProcess = spawn("node", [serverPath], {
    cwd: serverBase, // important: cwd to find node_modules here
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "pipe",   // pipe stdio instead of inherit
    windowsHide: true, // hide console window on Windows
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Backend ERR] ${data.toString().trim()}`);
  });

  serverProcess.on("error", (err) => {
    console.error("❌ Backend failed to start:", err);
  });

  serverProcess.on("exit", (code, signal) => {
    console.log(`⚠️ Backend process exited with code ${code}, signal ${signal}`);
  });
}

ipcMain.handle("get-backend-url", () => {
  return process.env.ELECTRON_DEV
    ? "http://localhost:3000"
    : "http://localhost:3000"; 
});


app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Kill backend process only when app is quitting
app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Quit app when all windows closed (normal behavior)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});