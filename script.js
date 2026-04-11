const FALLBACK_WALLPAPER_VIDEOS = [
    'amiya calm.mp4',
    'amiya room.mp4',
    'amiya valkyrie.mp4',
    'wallpaper.mp4',
    'wuling.mp4'
];

let wallpaperVideos = [];
let currentWallpaperVideo = null;

function randomItem(items, excludedItem = null) {
    const pool = excludedItem ? items.filter((item) => item !== excludedItem) : items;

    if (!pool.length) {
        return null;
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

function readDirectoryEntries(directoryReader) {
    return new Promise((resolve, reject) => {
        const entries = [];

        const readBatch = () => {
            directoryReader.readEntries((batch) => {
                if (!batch.length) {
                    resolve(entries);
                    return;
                }

                entries.push(...batch);
                readBatch();
            }, reject);
        };

        readBatch();
    });
}

async function collectWallpaperVideos(directoryEntry, prefix = '') {
    const entries = await readDirectoryEntries(directoryEntry.createReader());
    const files = [];

    for (const entry of entries) {
        if (entry.isFile && entry.name.toLowerCase().endsWith('.mp4')) {
            files.push(`${prefix}${entry.name}`);
            continue;
        }

        if (entry.isDirectory) {
            const nestedFiles = await collectWallpaperVideos(entry, `${prefix}${entry.name}/`);
            files.push(...nestedFiles);
        }
    }

    return files;
}

function getWallpaperVideosFromPackage() {
    if (!chrome?.runtime?.getPackageDirectoryEntry) {
        return Promise.resolve([...FALLBACK_WALLPAPER_VIDEOS]);
    }

    return new Promise((resolve) => {
        chrome.runtime.getPackageDirectoryEntry((rootDirectory) => {
            try {
                rootDirectory.getDirectory('Wallpapers', { create: false }, (wallpapersDirectory) => {
                    collectWallpaperVideos(wallpapersDirectory)
                        .then((files) => {
                            resolve(files.length ? files : [...FALLBACK_WALLPAPER_VIDEOS]);
                        })
                        .catch(() => resolve([...FALLBACK_WALLPAPER_VIDEOS]));
                }, () => resolve([...FALLBACK_WALLPAPER_VIDEOS]));
            } catch (error) {
                resolve([...FALLBACK_WALLPAPER_VIDEOS]);
            }
        });
    });
}

function setMode(mode) {
    const tabButton = document.getElementById('mode-tab');
    const holoButton = document.getElementById('mode-holo');
    const holoView = document.getElementById('holo-view');
    const content = document.getElementById('content');

    const isHolo = mode === 'holo';

    tabButton.classList.toggle('active', !isHolo);
    holoButton.classList.toggle('active', isHolo);
    holoView.classList.toggle('hidden', !isHolo);
    holoView.setAttribute('aria-hidden', String(!isHolo));
    content.classList.toggle('hidden', isHolo);
}

async function initVideo() {
    const videoElement = document.getElementById('bg-video');
    wallpaperVideos = await getWallpaperVideosFromPackage();

    const playWallpaper = () => {
        const nextVideo = randomItem(wallpaperVideos, currentWallpaperVideo) || randomItem(wallpaperVideos);

        if (!nextVideo) {
            document.body.style.background = '#111';
            console.error('No playable wallpaper videos found. Verify Wallpapers/*.mp4 files are valid and not Git LFS pointer files.');
            return;
        }

        currentWallpaperVideo = nextVideo;
        const videoUrl = chrome?.runtime?.getURL
            ? chrome.runtime.getURL(`Wallpapers/${nextVideo}`)
            : `Wallpapers/${nextVideo}`;

        videoElement.src = videoUrl;
        videoElement.load();
        videoElement.play().catch(() => {});
    };

    const handleVideoError = () => {
        console.warn(`Failed to load wallpaper video: ${currentWallpaperVideo ?? 'unknown'}`);
        wallpaperVideos = wallpaperVideos.filter((video) => video !== currentWallpaperVideo);

        if (!wallpaperVideos.length) {
            document.body.style.background = '#111';
            console.error('All wallpaper videos failed to load. If files came from git, run git lfs pull and reload the extension.');
            return;
        }

        playWallpaper();
    };

    videoElement.addEventListener('error', handleVideoError);
    playWallpaper();
}

function updateClock() {
    const now = new Date();
    
    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    // Day
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    document.getElementById('day').textContent = days[now.getDay()];
    
    // Date
    const months = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const month = months[now.getMonth()];
    const date = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('date').textContent = `${month} ${date}, ${year}`;
}

// Initialize
void initVideo();
updateClock();
setInterval(updateClock, 1000);

document.getElementById('mode-tab').addEventListener('click', () => setMode('tab'));
document.getElementById('mode-holo').addEventListener('click', () => setMode('holo'));

setMode('tab');
