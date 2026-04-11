param(
    [string]$RepositoryUrl = '',
    [string]$Branch = 'main',
    [string]$CommitMessage = 'Initial commit: Chrome home extension setup',
    [switch]$Private
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-Tool($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required tool not found in PATH: $name"
    }
}

Assert-Tool git

function Enable-LfsForWallpapers {
    param([string]$RootPath)

    Push-Location $RootPath
    try {
        $hasWallpapers = Test-Path -LiteralPath (Join-Path $RootPath 'Wallpapers')
        if (-not $hasWallpapers) {
            return
        }

        $hasMp4 = @(Get-ChildItem -LiteralPath (Join-Path $RootPath 'Wallpapers') -File -Filter '*.mp4' -ErrorAction SilentlyContinue).Count -gt 0
        if (-not $hasMp4) {
            return
        }

        $null = (& git lfs version 2>$null)
        if ($LASTEXITCODE -ne 0) {
            throw 'This project contains wallpaper videos. Install Git LFS first, then rerun publish script.'
        }

        & git lfs install | Out-Null
        & git lfs track 'Wallpapers/*.mp4' | Out-Null
    } finally {
        Pop-Location
    }
}

$projectDir = $PSScriptRoot
Set-Location $projectDir

if (-not (Test-Path -LiteralPath (Join-Path $projectDir 'manifest.json'))) {
    throw 'This does not look like the extension root folder (manifest.json missing).'
}

$insideRepo = $true
try {
    git rev-parse --is-inside-work-tree *> $null
} catch {
    $insideRepo = $false
}

if (-not $insideRepo) {
    git init | Out-Null
}

$currentBranch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    git checkout -b $Branch | Out-Null
} elseif ($currentBranch -ne $Branch) {
    git checkout -B $Branch | Out-Null
}

if (-not (Test-Path -LiteralPath (Join-Path $projectDir '.gitignore'))) {
    @(
        'Thumbs.db',
        '.DS_Store',
        '*.log',
        '.env',
        '.vscode/'
    ) | Set-Content -Path (Join-Path $projectDir '.gitignore') -Encoding UTF8
}

Enable-LfsForWallpapers -RootPath $projectDir

git add -A

$hasStaged = $true
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    $hasStaged = $false
}

if ($hasStaged) {
    git commit -m $CommitMessage | Out-Null
}

$existingOrigin = ''
try {
    $existingOrigin = (git remote get-url origin 2>$null).Trim()
} catch {
    $existingOrigin = ''
}

if (-not [string]::IsNullOrWhiteSpace($RepositoryUrl)) {
    if ([string]::IsNullOrWhiteSpace($existingOrigin)) {
        git remote add origin $RepositoryUrl
    } elseif ($existingOrigin -ne $RepositoryUrl) {
        git remote set-url origin $RepositoryUrl
    }
}

$originUrl = ''
try {
    $originUrl = (git remote get-url origin 2>$null).Trim()
} catch {
    $originUrl = ''
}

if ([string]::IsNullOrWhiteSpace($originUrl)) {
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        $repoName = Split-Path -Leaf $projectDir
        $visibilityArg = if ($Private) { '--private' } else { '--public' }
        gh repo create $repoName $visibilityArg --source . --remote origin --push
        $originUrl = (git remote get-url origin 2>$null).Trim()
    } else {
        Write-Host ''
        Write-Host 'No origin remote configured yet.' -ForegroundColor Yellow
        Write-Host 'Create a GitHub repo, then run:' -ForegroundColor Yellow
        Write-Host '  .\publish-to-github.ps1 -RepositoryUrl https://github.com/<user>/<repo>.git' -ForegroundColor White
        exit 0
    }
}

git push -u origin $Branch

Write-Host ''
Write-Host 'Published to GitHub:' -ForegroundColor Cyan
Write-Host "  $originUrl" -ForegroundColor White
