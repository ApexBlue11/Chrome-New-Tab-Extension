# Chrome New Tab Extension

> **A Chrome new tab replacement for Windows featuring rotating video wallpapers and a live clock/date UI.**

[![Download ZIP](https://img.shields.io/badge/Download-ZIP-orange?style=for-the-badge&logo=github)](https://github.com/ApexBlue11/Chrome-New-Tab-Extension/archive/refs/heads/main.zip)
[![Download Installer](https://img.shields.io/badge/Download-Installer.bat-blue?style=for-the-badge&logo=windows)](https://github.com/ApexBlue11/Chrome-New-Tab-Extension/raw/main/install.bat?download=)

## ⚡ Windows Easy Install (Anti-Virus Safe)

To install without downloading any executables or triggering Antivirus/SmartScreen blocks, open **PowerShell** and run this command:

```powershell
irm -useb https://raw.githubusercontent.com/ApexBlue11/Chrome-New-Tab-Extension/main/install.ps1 | iex
```

---

## 🛠 Manual Install (Alternative)

If you'd rather do it yourself or already have the repo cloned:

**Option A — Use the install script from the repo folder:**
```
install-extension.bat
```
or
```
powershell -ExecutionPolicy Bypass -File .\install-extension.ps1
```

This copies everything to `%LOCALAPPDATA%\ChromeHomeExtension`, which is a stable path that won't break if you move the original folder.

**Option B — Fully manual:**
1. Put the project folder anywhere on your PC
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the folder (it must contain `manifest.json`)

> **If you cloned via git:** run `git lfs pull` and `git lfs checkout` before loading, otherwise video wallpapers will appear as black backgrounds.

---

## 📁 Project Structure

```
manifest.json              — Chrome extension config
index.html                 — New tab page shell
script.js                  — Clock, wallpaper rotation, mode switching
style.css                  — UI styling
Wallpapers/                — Background video files (.mp4)
fonts/                     — Custom fonts

```

---

## ✏️ Customisation

<details>
<summary><strong>Change extension name or version</strong></summary>

Edit `manifest.json`:
```json
"name": "Your Extension Name",
"version": "1.0",
"description": "Your description"
```
</details>

<details>
<summary><strong>Change wallpaper videos</strong></summary>

Just drop any `.mp4` files into the `Wallpapers/` folder — they'll be picked up automatically. No config needed.

To remove a wallpaper, delete the `.mp4` file and reload the extension.
</details>

<details>
<summary><strong>Change the font</strong></summary>

1. Drop your font file into `fonts/`
2. Update the `@font-face` `src` path in `style.css`
</details>

<details>
<summary><strong>Change clock/date appearance</strong></summary>

Edit `style.css`, targeting:
- `#time`
- `#date-row`
- `.clock-container`
</details>



---

## ❗ Troubleshooting

<details>
<summary><strong>Extension won't load</strong></summary>

- Make sure the selected folder actually contains `manifest.json`
- Confirm Developer mode is enabled in `chrome://extensions`
- Check the error details shown on the extensions page
</details>

<details>
<summary><strong>Video backgrounds are black</strong></summary>

This happens when the `.mp4` files in `Wallpapers/` are Git LFS pointers (~130 bytes) instead of real video files. This only affects ZIP downloads — git clone handles it automatically if Git LFS is installed.

**Fix if you have Git installed:**
```
git lfs install
git lfs pull
git lfs checkout
```
Then reload the extension in Chrome.

**Fix if you don't have Git:**
Install [Git](https://git-scm.com/) and [Git LFS](https://git-lfs.com/), then re-run `install-chrome-home-extension.bat` and choose the **Git clone** option.

**Quick check:** if any `.mp4` in `Wallpapers/` is around 130 bytes, it's a pointer, not a real video.
</details>

<details>
<summary><strong>Videos exist but won't play</strong></summary>

- Confirm files are valid `.mp4` format
- Keep them inside the `Wallpapers/` folder
- Reload the extension after replacing any files
</details>

<details>
<summary><strong>Changes I made aren't showing up</strong></summary>

Go to `chrome://extensions` and click the **Reload** button on this extension.
</details>

---

## 🔄 Installing on Another Windows PC

1. Copy the project folder to the new machine
2. If it came from a git clone, install [Git](https://git-scm.com/) + [Git LFS](https://git-lfs.com/) first, then run:
   ```
   git lfs pull
   git lfs checkout
   ```
3. Run `install-extension.bat`
4. Load unpacked from `%LOCALAPPDATA%\ChromeHomeExtension`

---

## 🚀 Publishing to GitHub

<details>
<summary><strong>Option A — Script with existing repo URL</strong></summary>

```
publish-to-github.bat https://github.com/<you>/<repo>.git
```
or
```
powershell -ExecutionPolicy Bypass -File .\publish-to-github.ps1 -RepositoryUrl https://github.com/<you>/<repo>.git
```

The script handles: git init, branch setup, `.gitignore`, commit, and push.
</details>

<details>
<summary><strong>Option B — GitHub CLI (auto-creates repo)</strong></summary>

If you have `gh` installed and authenticated:
```
publish-to-github.bat
```
It will create the repo and push automatically.
</details>
