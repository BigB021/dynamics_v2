# build-windows.ps1

Write-Host "Cleaning previous builds..."
Remove-Item -Recurse -Force dist, build, release -ErrorAction SilentlyContinue

Write-Host "Installing backend dependencies (production-only)..."
Set-Location -Path ".\music-server"
npm install --production
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to install backend dependencies"
  exit 1
}
Set-Location -Path ".."

Write-Host "Building frontend (Vite)..."
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Error "Frontend build failed"
  exit 1
}

# Detect Windows SpotDL path
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$spotdlPath = Join-Path $projectRoot "venv\Scripts\spotdl.exe"

if (-Not (Test-Path $spotdlPath)) {
  Write-Error "SpotDL binary not found at: $spotdlPath"
  Write-Host "Please create venv and run: pip install spotdl"
  exit 1
} else {
  Write-Host "SpotDL found at: $spotdlPath"
}

Write-Host "Building Electron app for Windows..."
npm run build-electron
if ($LASTEXITCODE -ne 0) {
  Write-Error "Electron build failed"
  exit 1
}

Write-Host " Build completed successfully!"
