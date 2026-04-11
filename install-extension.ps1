param(
    [string]$SourceDir = $PSScriptRoot,
    [string]$InstallDir = "$env:LOCALAPPDATA\ChromeHomeExtension",
    [bool]$OpenExtensionsPage = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-IsLfsPointer {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    $fileInfo = Get-Item -LiteralPath $Path
    if ($fileInfo.Length -gt 1024) {
        return $false
    }

    $firstLine = Get-Content -LiteralPath $Path -TotalCount 1 -ErrorAction SilentlyContinue
    return $firstLine -like 'version https://git-lfs.github.com/spec/*'
}

function Resolve-LfsMediaIfNeeded {
    param([string]$RootPath)

    $wallpaperDir = Join-Path $RootPath 'Wallpapers'
    if (-not (Test-Path -LiteralPath $wallpaperDir)) {
        return
    }

    $mp4Files = Get-ChildItem -LiteralPath $wallpaperDir -File -Filter '*.mp4' -ErrorAction SilentlyContinue
    if (-not $mp4Files) {
        return
    }

    $pointerFiles = @($mp4Files | Where-Object { Test-IsLfsPointer -Path $_.FullName })
    if ($pointerFiles.Count -eq 0) {
        return
    }

    Write-Warning 'Detected Git LFS pointer files in Wallpapers/. Attempting to fetch real video content...'

    Push-Location $RootPath
    try {
        if (-not (Test-Path -LiteralPath (Join-Path $RootPath '.git'))) {
            throw 'Wallpapers contain LFS pointers, but this folder is not a git checkout. Clone using git + git-lfs or copy real media files.'
        }

        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            throw 'git is required to resolve LFS media.'
        }

        $null = (& git lfs version 2>$null)
        if ($LASTEXITCODE -ne 0) {
            throw 'git-lfs is required to resolve wallpaper videos. Install Git LFS, then rerun installer.'
        }

        & git lfs pull
        if ($LASTEXITCODE -ne 0) {
            throw 'git lfs pull failed while fetching wallpaper media.'
        }

        & git lfs checkout
        if ($LASTEXITCODE -ne 0) {
            throw 'git lfs checkout failed while restoring wallpaper media.'
        }
    } finally {
        Pop-Location
    }

    $refreshedPointers = @(
        Get-ChildItem -LiteralPath $wallpaperDir -File -Filter '*.mp4' -ErrorAction SilentlyContinue |
            Where-Object { Test-IsLfsPointer -Path $_.FullName }
    )

    if ($refreshedPointers.Count -gt 0) {
        throw 'Some wallpaper files are still LFS pointers after fetch. Verify GitHub auth/network and rerun installer.'
    }
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
    throw "Source directory not found: $SourceDir"
}

$requiredFiles = @('manifest.json', 'index.html', 'script.js', 'style.css')
foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $SourceDir $file))) {
        throw "Required file missing in source: $file"
    }
}

Resolve-LfsMediaIfNeeded -RootPath $SourceDir

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
