# BambooKit Desktop installer for Windows.
#   irm https://bambookit-web.onrender.com/install.ps1 | iex
# Downloads the latest BambooKit Desktop setup from GitHub Releases, checks its code signature
# (warning if it is unsigned), and runs it.
$ErrorActionPreference = "Stop"
$repo = "BambooKit/bambookit-desktop"

if (-not [Environment]::Is64BitOperatingSystem) { throw "BambooKit Desktop requires 64-bit Windows." }

Write-Host "Looking up the latest BambooKit Desktop release..." -ForegroundColor Cyan
try {
  $release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest" -Headers @{ "User-Agent" = "bambookit-installer" }
} catch {
  throw "No BambooKit Desktop release is published yet. Install from source instead: https://bambookit-web.onrender.com/docs/install#from-source"
}

$asset = $release.assets | Where-Object { $_.name -match '\.exe$' -and $_.name -match 'x64|setup|BambooKit' } | Select-Object -First 1
if (-not $asset) { throw "Release $($release.tag_name) has no Windows installer." }

$dest = Join-Path $env:TEMP $asset.name
Write-Host "Downloading $($asset.name) ($([math]::Round($asset.size / 1MB)) MB)..." -ForegroundColor Cyan
Invoke-WebRequest $asset.browser_download_url -OutFile $dest -UseBasicParsing

$sig = Get-AuthenticodeSignature $dest
if ($sig.Status -ne "Valid") {
  Write-Warning "The installer is not code-signed ($($sig.Status)). Windows SmartScreen may warn you."
}

Write-Host "Starting the installer..." -ForegroundColor Cyan
Start-Process $dest -Wait
Write-Host "BambooKit Desktop is installed. Open it from the Start menu." -ForegroundColor Green
