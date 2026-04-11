# Chrome Home Extension (Windows Ready)

This project is a Chrome New Tab extension with:

- Random video wallpapers
- Live clock/date UI
- A HOLO TABLE view in an embedded scene

The setup below is designed to work consistently on Windows systems.

## 1) Recommended Folder Location on Windows

Use the installer script to place the extension in a stable location:

- %LOCALAPPDATA%\\ChromeHomeExtension

This avoids issues caused by moving/deleting the original folder.

## 2) Quick Install (Windows)

From this project folder, run either:

- install-extension.bat
- or: powershell -ExecutionPolicy Bypass -File .\\install-extension.ps1

What it does:

- Copies the extension files to %LOCALAPPDATA%\\ChromeHomeExtension
- Keeps paths relative (portable across Windows user accounts)
- Opens chrome://extensions (if Chrome is available in PATH)

After script finishes:

1. Turn on Developer mode in Chrome extensions page
2. Click Load unpacked
3. Select: %LOCALAPPDATA%\\ChromeHomeExtension

## 3) Manual Install (if you prefer)

1. Put the project folder anywhere
2. Open chrome://extensions
3. Enable Developer mode
4. Click Load unpacked
5. Select the extension root (must contain manifest.json)

## 4) Upload / Publish to GitHub

### Option A: One command with script

If you already created a GitHub repository:

- publish-to-github.bat https://github.com/<your-user>/<your-repo>.git

or:

- powershell -ExecutionPolicy Bypass -File .\\publish-to-github.ps1 -RepositoryUrl https://github.com/<your-user>/<your-repo>.git

The script will:

- Initialize git if needed
- Create/switch to main branch
- Add .gitignore (if missing)
- Commit all files
- Add/update origin
- Push to GitHub

### Option B: Let GitHub CLI create repo

If gh (GitHub CLI) is installed and authenticated, run:

- publish-to-github.bat

It will create a repo from this folder and push automatically.

## 5) Project Structure

- manifest.json: Chrome extension config
- index.html: New tab page shell
- script.js: New tab behavior (clock, wallpaper rotation, mode switching)
- style.css: UI styling
- Wallpapers/: Background videos (.mp4)
- fonts/: Custom font files
- holo-prototype/building.html: HOLO TABLE page
- holo-prototype/building.js: HOLO TABLE rendering/interaction

## 6) How to Customize

### Change extension name/version

Edit manifest.json:

- name
- version
- description

### Change wallpaper videos

1. Add or remove .mp4 files in Wallpapers/
2. If needed, update fallback list in script.js (FALLBACK_WALLPAPER_VIDEOS)

### Change font

1. Place your font in fonts/
2. Update style.css @font-face src path

### Change clock/date appearance

Edit style.css:

- #time
- #date-row
- .clock-container

### Change HOLO TABLE visuals

Edit:

- holo-prototype/building.html (layout/theme tokens)
- holo-prototype/building.js (geometry, animation, controls)

## 7) Troubleshooting

### Extension does not load

- Make sure selected folder contains manifest.json
- Confirm Developer mode is enabled
- Open chrome://extensions and check error details

### Videos not playing

- Ensure files are valid .mp4
- Keep videos inside Wallpapers/
- Reload extension after replacing files

### New changes not visible

- Go to chrome://extensions
- Click the Reload button on this extension

## 8) Updating on another Windows PC

1. Copy project folder to the new machine
2. Run install-extension.bat
3. Load unpacked from %LOCALAPPDATA%\\ChromeHomeExtension

That is all needed to run the same extension on another Windows system.
