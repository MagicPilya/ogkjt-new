param(
  [switch]$SkipInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not $SkipInstall) {
  Write-Host "`n==> Install dependencies" -ForegroundColor Cyan
  & npm ci
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: Install dependencies"
  }
}

Write-Host "`n==> Build Next.js with webpack" -ForegroundColor Cyan
& npm run build -- --webpack
if ($LASTEXITCODE -ne 0) {
  throw "Step failed: Build Next.js"
}

$deployDir = Join-Path $repoRoot "deploy-web"
if (Test-Path $deployDir) {
  Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "`n==> Prepare lightweight deploy package" -ForegroundColor Cyan

# Standalone output contains server.js and traced runtime deps.
Copy-Item -Path (Join-Path $repoRoot ".next/standalone/*") -Destination $deployDir -Recurse -Force

$nextDir = Join-Path $deployDir ".next"
if (-not (Test-Path $nextDir)) {
  New-Item -ItemType Directory -Path $nextDir | Out-Null
}
Copy-Item -Path (Join-Path $repoRoot ".next/static") -Destination $nextDir -Recurse -Force
Copy-Item -Path (Join-Path $repoRoot "public") -Destination $deployDir -Recurse -Force

$tmpDir = Join-Path $deployDir "tmp"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
Set-Content -Path (Join-Path $tmpDir "restart.txt") -Value (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")

Write-Host "`nDone. Upload this folder to server:" -ForegroundColor Green
Write-Host "  $deployDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "For this package, set cPanel startup file to: server.js" -ForegroundColor Yellow
