param(
    [string]$SourceDir = $PSScriptRoot,
    [string]$InstallDir = "$env:LOCALAPPDATA\ChromeHomeExtension",
    [bool]$OpenExtensionsPage = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SourceDir)) {
    throw "Source directory not found: $SourceDir"
}

$requiredFiles = @('manifest.json', 'index.html', 'script.js', 'style.css')
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $SourceDir $file))) {
        throw "Required file missing in source: $file"
    }
}

if (-not (Test-Path -LiteralPath $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$excludeDirs = @('.git', '.github', '.vscode', 'node_modules')
$excludeFiles = @('*.log')

$robocopyArgs = @(
    $SourceDir,
    $InstallDir,
    '/MIR',
    '/R:1',
    '/W:1',
    '/NFL',
    '/NDL',
    '/NJH',
    '/NJS',
    '/NP'
)

if ($excludeDirs.Count -gt 0) {
    $robocopyArgs += '/XD'
    $robocopyArgs += $excludeDirs
}

if ($excludeFiles.Count -gt 0) {
    $robocopyArgs += '/XF'
    $robocopyArgs += $excludeFiles
}

& robocopy @robocopyArgs | Out-Null
$robocopyExitCode = $LASTEXITCODE

if ($robocopyExitCode -ge 8) {
    throw "Install copy failed. Robocopy exit code: $robocopyExitCode"
}

Write-Host ''
Write-Host 'Extension files installed to:' -ForegroundColor Cyan
Write-Host "  $InstallDir" -ForegroundColor Yellow
Write-Host ''
Write-Host 'Next steps in Chrome:' -ForegroundColor Cyan
Write-Host '  1. Open chrome://extensions' -ForegroundColor White
Write-Host '  2. Enable Developer mode' -ForegroundColor White
Write-Host '  3. Click Load unpacked' -ForegroundColor White
Write-Host "  4. Select: $InstallDir" -ForegroundColor White
Write-Host ''

if ($OpenExtensionsPage) {
    try {
        Start-Process 'chrome.exe' 'chrome://extensions' | Out-Null
    } catch {
        Write-Warning 'Could not auto-open Chrome. Open chrome://extensions manually.'
    }
}
