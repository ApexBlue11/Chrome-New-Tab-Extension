const svgNs = 'http://www.w3.org/2000/svg';

const stage = document.getElementById('building-root');
const titleEl = document.getElementById('building-name');
const descriptionEl = document.getElementById('building-description');
const counterEl = document.getElementById('counter');
const controlsEl = document.getElementById('controls');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

function seedRandom(seed) {
    let state = seed >>> 0;

    return function () {
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function createSvgElement(tagName, attributes = {}) {
    const node = document.createElementNS(svgNs, tagName);

    for (const [key, value] of Object.entries(attributes)) {
        if (value !== null && value !== undefined && value !== '') {
            node.setAttribute(key, value);
        }
    }

    return node;
}

function append(parent, tagName, attributes = {}) {
    const node = createSvgElement(tagName, attributes);
    parent.appendChild(node);
    return node;
}

function pointsToString(points) {
    return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function pointBetween(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
    };
}

function quadPoint(surface, u, v) {
    const top = pointBetween(surface.tl, surface.tr, u);
    const bottom = pointBetween(surface.bl, surface.br, u);
    return pointBetween(top, bottom, v);
}

function drawSurface(group, surface, options = {}) {
    const random = seedRandom(options.seed ?? 1);
    const stroke = options.stroke ?? '#7efcff';
    const fill = options.fill ?? 'url(#frontFill)';
    const fillOpacity = options.fillOpacity ?? 0.1;
    const rowCount = options.rows ?? 24;
    const colCount = options.cols ?? 8;
    const windowCount = options.windows ?? 40;
    const windowWidth = options.windowWidth ?? 8;
    const windowHeight = options.windowHeight ?? 12;

    append(group, 'polygon', {
        points: pointsToString([surface.tl, surface.tr, surface.br, surface.bl]),
        fill,
        'fill-opacity': fillOpacity,
        stroke,
        'stroke-opacity': options.strokeOpacity ?? 0.68,
        'stroke-width': options.strokeWidth ?? 2.4,
        class: 'line-art'
    });

    for (let row = 1; row < rowCount; row += 1) {
        const t = row / rowCount;
        const left = pointBetween(surface.tl, surface.bl, t);
        const right = pointBetween(surface.tr, surface.br, t);
        const thick = row % 5 === 0;

        append(group, 'line', {
            x1: left.x,
            y1: left.y,
            x2: right.x,
            y2: right.y,
            stroke,
            'stroke-opacity': thick ? 0.34 : 0.18,
            'stroke-width': thick ? 1.9 : 1.1,
            class: 'line-art'
        });
    }

    for (let col = 1; col < colCount; col += 1) {
        const t = col / colCount;
        const top = pointBetween(surface.tl, surface.tr, t);
        const bottom = pointBetween(surface.bl, surface.br, t);
        const thick = col % 3 === 0;

        append(group, 'line', {
            x1: top.x,
            y1: top.y,
            x2: bottom.x,
            y2: bottom.y,
            stroke,
            'stroke-opacity': thick ? 0.26 : 0.12,
            'stroke-width': thick ? 1.5 : 1,
            class: 'line-art'
        });
    }

    for (let i = 0; i < windowCount; i += 1) {
        const u = 0.05 + random() * 0.9;
        const v = 0.05 + random() * 0.88;
        const point = quadPoint(surface, u, v);
        const bright = random() > 0.58;

        append(group, 'rect', {
            x: point.x - windowWidth / 2,
            y: point.y - windowHeight / 2,
            width: windowWidth,
            height: windowHeight,
            rx: 1.1,
            fill: bright ? '#f7ffff' : '#7efcff',
            'fill-opacity': bright ? 0.92 : 0.22,
            class: bright && random() > 0.65 ? 'flicker' : ''
        });
    }
}

function drawLattice(group, points, options = {}) {
    const stroke = options.stroke ?? '#7efcff';
    const opacity = options.opacity ?? 0.32;
    const width = options.strokeWidth ?? 1.4;

    append(group, 'polygon', {
        points: pointsToString(points),
        fill: options.fill ?? 'none',
        'fill-opacity': options.fillOpacity ?? 0,
        stroke,
        'stroke-opacity': options.strokeOpacity ?? opacity,
        'stroke-width': width,
        class: 'line-art'
    });
}

function drawBridge(group, from, to, options = {}) {
    append(group, 'line', {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        stroke: options.stroke ?? '#7efcff',
        'stroke-opacity': options.opacity ?? 0.34,
        'stroke-width': options.strokeWidth ?? 2,
        class: 'line-art'
    });

    if (options.double) {
        append(group, 'line', {
            x1: from.x,
            y1: from.y + 6,
            x2: to.x,
            y2: to.y + 6,
            stroke: options.stroke ?? '#7efcff',
            'stroke-opacity': (options.opacity ?? 0.34) * 0.6,
            'stroke-width': 1.2,
            class: 'line-art'
        });
    }
}

function drawColumnLights(group, points, options = {}) {
    points.forEach(([x, y], index) => {
        append(group, 'rect', {
            x: x - (options.width ?? 5),
            y: y - (options.height ?? 7),
            width: (options.width ?? 10) + (index % 2),
            height: options.height ?? 14,
            rx: 1.2,
            fill: index % 3 === 0 ? '#f7ffff' : '#7efcff',
            'fill-opacity': index % 3 === 0 ? 0.9 : 0.28,
            class: index % 4 === 0 ? 'flicker' : ''
        });
    });
}

function centerRoot(x = 800, y = 460, scale = 1) {
    return append(stage, 'g', {
        transform: `translate(${x} ${y}) scale(${scale})`
    });
}

function renderAsterSpire(root) {
    const group = centerRoot(800, 445, 1);

    const leftWing = {
        tl: { x: -124, y: -202 },
        tr: { x: -94, y: -208 },
        br: { x: -90, y: 212 },
        bl: { x: -126, y: 206 }
    };

    const front = {
        tl: { x: -86, y: -262 },
        tr: { x: 82, y: -272 },
        br: { x: 90, y: 256 },
        bl: { x: -92, y: 268 }
    };

    const side = {
        tl: { x: 82, y: -272 },
        tr: { x: 138, y: -252 },
        br: { x: 142, y: 274 },
        bl: { x: 90, y: 256 }
    };

    append(group, 'path', {
        d: 'M-88 -262 C-78 -298 -48 -320 0 -322 C40 -322 72 -308 86 -284',
        fill: 'none',
        stroke: '#7efcff',
        'stroke-opacity': 0.62,
        'stroke-width': 2.4,
        class: 'line-art'
    });

    append(group, 'path', {
        d: 'M-72 -248 C-44 -268 -16 -274 18 -270 C52 -266 70 -252 80 -236',
        fill: 'none',
        stroke: '#dffcff',
        'stroke-opacity': 0.38,
        'stroke-width': 1.8,
        class: 'line-art'
    });

    drawSurface(group, leftWing, {
        seed: 11,
        fill: 'url(#sideFill)',
        fillOpacity: 0.08,
        rows: 18,
        cols: 4,
        windows: 22,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.5
    });

    drawSurface(group, front, {
        seed: 19,
        fill: 'url(#frontFill)',
        fillOpacity: 0.12,
        rows: 32,
        cols: 11,
        windows: 92,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.7
    });

    drawSurface(group, side, {
        seed: 31,
        fill: 'url(#sideFill)',
        fillOpacity: 0.1,
        rows: 28,
        cols: 7,
        windows: 46,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.64
    });

    drawLattice(group, [
        { x: -96, y: 206 },
        { x: 88, y: 196 },
        { x: 92, y: 242 },
        { x: -98, y: 252 }
    ], {
        fill: 'none',
        strokeOpacity: 0.5,
        strokeWidth: 2.2
    });

    drawBridge(group, { x: -66, y: -126 }, { x: 76, y: -132 }, { opacity: 0.34, strokeWidth: 2.2, double: true });
    drawBridge(group, { x: -50, y: -92 }, { x: 58, y: -96 }, { opacity: 0.26, strokeWidth: 1.8 });

    const crownMasts = [
        [18, -312, 18, -274],
        [42, -300, 42, -270],
        [66, -286, 66, -258]
    ];

    crownMasts.forEach(([x1, y1, x2, y2]) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': 0.58,
            'stroke-width': 1.8,
            class: 'line-art'
        });
    });

    append(group, 'line', {
        x1: -18,
        y1: -310,
        x2: 18,
        y2: -310,
        stroke: '#f7ffff',
        'stroke-opacity': 0.78,
        'stroke-width': 1.4,
        class: 'line-art'
    });

    drawColumnLights(group, [
        [-62, -230], [-18, -204], [22, -190], [56, -168],
        [-58, -126], [-16, -108], [22, -88], [56, -70],
        [-58, -32], [-14, -14], [24, 10], [58, 26],
        [-56, 68], [-14, 88], [24, 108], [60, 126],
        [-56, 164], [-14, 182], [26, 200], [60, 220]
    ]);
}

function renderTerraceStack(root) {
    const group = centerRoot(800, 470, 1);

    const blocks = [
        {
            surface: {
                tl: { x: -118, y: 86 },
                tr: { x: 118, y: 76 },
                br: { x: 126, y: 250 },
                bl: { x: -124, y: 258 }
            },
            seed: 41,
            rows: 16,
            cols: 11,
            windows: 42,
            fillOpacity: 0.12
        },
        {
            surface: {
                tl: { x: -92, y: -24 },
                tr: { x: 94, y: -36 },
                br: { x: 102, y: 86 },
                bl: { x: -100, y: 98 }
            },
            seed: 53,
            rows: 14,
            cols: 9,
            windows: 34,
            fillOpacity: 0.11
        },
        {
            surface: {
                tl: { x: -68, y: -146 },
                tr: { x: 70, y: -152 },
                br: { x: 80, y: -24 },
                bl: { x: -80, y: -18 }
            },
            seed: 67,
            rows: 12,
            cols: 7,
            windows: 24,
            fillOpacity: 0.12
        },
        {
            surface: {
                tl: { x: -44, y: -264 },
                tr: { x: 48, y: -268 },
                br: { x: 60, y: -146 },
                bl: { x: -56, y: -140 }
            },
            seed: 79,
            rows: 10,
            cols: 5,
            windows: 14,
            fillOpacity: 0.14
        }
    ];

    blocks.forEach((block, index) => {
        drawSurface(group, block.surface, {
            seed: block.seed,
            fill: index % 2 === 0 ? 'url(#frontFill)' : 'url(#sideFill)',
            fillOpacity: block.fillOpacity,
            rows: block.rows,
            cols: block.cols,
            windows: block.windows,
            windowWidth: index === 0 ? 8 : 7,
            windowHeight: index === 0 ? 12 : 10,
            strokeOpacity: 0.66
        });
    });

    const terraceRails = [
        [-118, 98, 118, 88],
        [-100, -12, 96, -22],
        [-74, -134, 72, -140],
        [-48, -252, 50, -256]
    ];

    terraceRails.forEach(([x1, y1, x2, y2]) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': 0.54,
            'stroke-width': 1.8,
            class: 'line-art'
        });
    });

    const terraceSteps = [
        [-112, 250, -96, 198], [-78, 248, -62, 176], [-44, 246, -28, 154],
        [-10, 244, 6, 132], [24, 242, 40, 110], [58, 240, 74, 88]
    ];

    terraceSteps.forEach(([x1, y1, x2, y2], index) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': index % 2 === 0 ? 0.3 : 0.18,
            'stroke-width': 1.6,
            class: 'line-art'
        });
    });

    drawColumnLights(group, [
        [-84, -236], [-42, -220], [-4, -204], [32, -188], [66, -170],
        [-92, -146], [-52, -130], [-14, -114], [22, -98], [58, -80],
        [-102, -24], [-60, -8], [-20, 8], [16, 24], [52, 40],
        [-110, 86], [-68, 102], [-28, 118], [8, 134], [44, 150], [80, 166],
        [-118, 214], [-78, 228], [-38, 240], [2, 246], [42, 248], [82, 250]
    ], {
        width: 6,
        height: 13
    });

    append(group, 'line', {
        x1: -54,
        y1: -278,
        x2: 54,
        y2: -278,
        stroke: '#f7ffff',
        'stroke-opacity': 0.74,
        'stroke-width': 1.4,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: -24,
        y1: -298,
        x2: -24,
        y2: -278,
        stroke: '#7efcff',
        'stroke-opacity': 0.62,
        'stroke-width': 1.6,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 0,
        y1: -306,
        x2: 0,
        y2: -278,
        stroke: '#7efcff',
        'stroke-opacity': 0.62,
        'stroke-width': 1.6,
        class: 'line-art'
    });
}

function renderTwinBlade(root) {
    const group = centerRoot(800, 445, 1);

    const leftBlade = {
        tl: { x: -146, y: -224 },
        tr: { x: -86, y: -238 },
        br: { x: -78, y: 214 },
        bl: { x: -138, y: 202 }
    };

    const core = {
        tl: { x: -70, y: -262 },
        tr: { x: 70, y: -262 },
        br: { x: 78, y: 250 },
        bl: { x: -78, y: 242 }
    };

    const rightBlade = {
        tl: { x: 86, y: -238 },
        tr: { x: 146, y: -224 },
        br: { x: 138, y: 202 },
        bl: { x: 78, y: 214 }
    };

    drawSurface(group, leftBlade, {
        seed: 91,
        fill: 'url(#sideFill)',
        fillOpacity: 0.09,
        rows: 22,
        cols: 5,
        windows: 28,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.5
    });

    drawSurface(group, core, {
        seed: 103,
        fill: 'url(#frontFill)',
        fillOpacity: 0.11,
        rows: 34,
        cols: 9,
        windows: 74,
        windowWidth: 7,
        windowHeight: 11,
        strokeOpacity: 0.72
    });

    drawSurface(group, rightBlade, {
        seed: 117,
        fill: 'url(#sideFill)',
        fillOpacity: 0.09,
        rows: 22,
        cols: 5,
        windows: 28,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.5
    });

    const topBridge = [
        [-86, -208], [-24, -218], [24, -218], [86, -208]
    ];

    drawLattice(group, topBridge, {
        fill: 'none',
        strokeOpacity: 0.42,
        strokeWidth: 2
    });

    append(group, 'line', {
        x1: -78,
        y1: -140,
        x2: 78,
        y2: -140,
        stroke: '#7efcff',
        'stroke-opacity': 0.32,
        'stroke-width': 2,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: -92,
        y1: -76,
        x2: 92,
        y2: -76,
        stroke: '#7efcff',
        'stroke-opacity': 0.24,
        'stroke-width': 1.6,
        class: 'line-art'
    });

    drawBridge(group, { x: -96, y: -42 }, { x: 96, y: -42 }, { opacity: 0.34, strokeWidth: 2.2, double: true });

    const spires = [
        [-22, -292, -22, -262],
        [0, -304, 0, -262],
        [22, -292, 22, -262]
    ];

    spires.forEach(([x1, y1, x2, y2]) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': 0.62,
            'stroke-width': 1.8,
            class: 'line-art'
        });
    });

    drawColumnLights(group, [
        [-120, -210], [-114, -180], [-110, -150], [-108, -120], [-104, -90], [-100, -60],
        [-98, -22], [-94, 8], [-92, 38], [-90, 68], [-88, 98], [-86, 128], [-84, 158], [-82, 188],
        [86, -210], [92, -180], [96, -150], [100, -120], [104, -90], [108, -60],
        [110, -22], [114, 8], [116, 38], [118, 68], [120, 98], [122, 128], [124, 158], [126, 188],
        [-46, -238], [-18, -214], [18, -214], [46, -238],
        [-42, -184], [-16, -162], [16, -162], [42, -184],
        [-40, -132], [-14, -110], [14, -110], [40, -132],
        [-38, -80], [-12, -58], [12, -58], [38, -80],
        [-36, -28], [-10, -6], [10, -6], [36, -28],
        [-34, 24], [-8, 46], [8, 46], [34, 24],
        [-32, 76], [-6, 98], [6, 98], [32, 76],
        [-30, 128], [-4, 150], [4, 150], [30, 128],
        [-28, 180], [-2, 202], [2, 202], [28, 180]
    ], {
        width: 6,
        height: 11
    });
}

function renderCantileverCrown(root) {
    const group = centerRoot(800, 472, 1);

    const lower = {
        tl: { x: -162, y: 70 },
        tr: { x: 64, y: 58 },
        br: { x: 72, y: 252 },
        bl: { x: -170, y: 262 }
    };

    const crown = {
        tl: { x: -18, y: -238 },
        tr: { x: 126, y: -246 },
        br: { x: 138, y: 70 },
        bl: { x: -6, y: 58 }
    };

    const cantilever = {
        tl: { x: 82, y: -276 },
        tr: { x: 194, y: -266 },
        br: { x: 188, y: -40 },
        bl: { x: 90, y: -52 }
    };

    drawSurface(group, lower, {
        seed: 131,
        fill: 'url(#frontFill)',
        fillOpacity: 0.11,
        rows: 18,
        cols: 11,
        windows: 52,
        windowWidth: 8,
        windowHeight: 11,
        strokeOpacity: 0.66
    });

    drawSurface(group, crown, {
        seed: 143,
        fill: 'url(#sideFill)',
        fillOpacity: 0.1,
        rows: 28,
        cols: 8,
        windows: 64,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.7
    });

    drawSurface(group, cantilever, {
        seed: 157,
        fill: 'url(#frontFill)',
        fillOpacity: 0.12,
        rows: 22,
        cols: 8,
        windows: 44,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.72
    });

    append(group, 'line', {
        x1: -100,
        y1: 64,
        x2: 64,
        y2: 58,
        stroke: '#7efcff',
        'stroke-opacity': 0.42,
        'stroke-width': 2.2,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 64,
        y1: 58,
        x2: 92,
        y2: -20,
        stroke: '#7efcff',
        'stroke-opacity': 0.34,
        'stroke-width': 2,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 74,
        y1: 112,
        x2: 132,
        y2: 112,
        stroke: '#7efcff',
        'stroke-opacity': 0.3,
        'stroke-width': 1.6,
        class: 'line-art'
    });

    const braces = [
        [-124, 190, -36, 86],
        [-94, 206, -6, 104],
        [-64, 222, 24, 120],
        [-34, 238, 54, 136]
    ];

    braces.forEach(([x1, y1, x2, y2]) => {
        drawBridge(group, { x: x1, y: y1 }, { x: x2, y: y2 }, { opacity: 0.34, strokeWidth: 2 });
    });

    const cantileverTruss = [
        [92, -52, 138, -168],
        [112, -48, 156, -156],
        [132, -44, 172, -144],
        [152, -42, 188, -132]
    ];

    cantileverTruss.forEach(([x1, y1, x2, y2], index) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': index % 2 === 0 ? 0.34 : 0.2,
            'stroke-width': 1.8,
            class: 'line-art'
        });
    });

    drawColumnLights(group, [
        [-132, 98], [-96, 96], [-60, 94], [-24, 92], [12, 90], [48, 88],
        [-146, 140], [-110, 138], [-74, 136], [-38, 134], [-2, 132], [34, 130], [70, 128],
        [-154, 188], [-118, 186], [-82, 184], [-46, 182], [-10, 180], [26, 178], [62, 176]
    ], {
        width: 7,
        height: 11
    });

    append(group, 'line', {
        x1: 94,
        y1: -276,
        x2: 182,
        y2: -276,
        stroke: '#f7ffff',
        'stroke-opacity': 0.7,
        'stroke-width': 1.4,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 112,
        y1: -296,
        x2: 112,
        y2: -276,
        stroke: '#7efcff',
        'stroke-opacity': 0.64,
        'stroke-width': 1.8,
        class: 'line-art'
    });
}

function renderPrismNeedle(root) {
    const group = centerRoot(800, 454, 1);

    const prismFront = {
        tl: { x: -82, y: -272 },
        tr: { x: 42, y: -288 },
        br: { x: 70, y: 236 },
        bl: { x: -96, y: 246 }
    };

    const prismSide = {
        tl: { x: 42, y: -288 },
        tr: { x: 112, y: -250 },
        br: { x: 122, y: 220 },
        bl: { x: 70, y: 236 }
    };

    const prismLeft = {
        tl: { x: -110, y: -248 },
        tr: { x: -82, y: -272 },
        br: { x: -96, y: 246 },
        bl: { x: -122, y: 228 }
    };

    drawSurface(group, prismLeft, {
        seed: 181,
        fill: 'url(#sideFill)',
        fillOpacity: 0.08,
        rows: 20,
        cols: 5,
        windows: 20,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.52
    });

    drawSurface(group, prismFront, {
        seed: 193,
        fill: 'url(#frontFill)',
        fillOpacity: 0.11,
        rows: 32,
        cols: 8,
        windows: 62,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.72
    });

    drawSurface(group, prismSide, {
        seed: 207,
        fill: 'url(#sideFill)',
        fillOpacity: 0.1,
        rows: 26,
        cols: 6,
        windows: 36,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.66
    });

    append(group, 'path', {
        d: 'M-74 -272 C-42 -304 -10 -316 24 -316 C54 -316 80 -304 102 -286',
        fill: 'none',
        stroke: '#7efcff',
        'stroke-opacity': 0.58,
        'stroke-width': 2.2,
        class: 'line-art'
    });

    append(group, 'path', {
        d: 'M-58 -252 C-28 -270 6 -276 40 -274 C68 -272 90 -262 108 -246',
        fill: 'none',
        stroke: '#dffcff',
        'stroke-opacity': 0.36,
        'stroke-width': 1.8,
        class: 'line-art'
    });

    const diagonalBands = [
        [-68, -208, 16, -188], [-72, -164, 18, -144], [-76, -120, 20, -100],
        [-80, -76, 22, -56], [-84, -32, 24, -12], [-88, 12, 26, 32],
        [-92, 56, 28, 76], [-94, 100, 30, 120], [-96, 144, 32, 164], [-96, 188, 34, 208]
    ];

    diagonalBands.forEach(([x1, y1, x2, y2], index) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': index % 2 === 0 ? 0.3 : 0.16,
            'stroke-width': 1.4,
            class: 'line-art'
        });
    });

    const spine = [
        [0, -310, 0, 240],
        [-14, -286, -14, 236],
        [16, -286, 16, 236]
    ];

    spine.forEach(([x1, y1, x2, y2], index) => {
        append(group, 'line', {
            x1,
            y1,
            x2,
            y2,
            stroke: '#7efcff',
            'stroke-opacity': index === 1 ? 0.58 : 0.38,
            'stroke-width': index === 1 ? 2.2 : 1.4,
            class: 'line-art'
        });
    });

    drawColumnLights(group, [
        [-50, -244], [-22, -232], [2, -222], [28, -214], [50, -202],
        [-56, -192], [-28, -182], [-2, -170], [24, -160], [52, -148],
        [-60, -126], [-30, -116], [-4, -104], [22, -94], [54, -82],
        [-62, -60], [-32, -50], [-6, -38], [20, -28], [56, -16],
        [-64, 8], [-34, 18], [-8, 30], [18, 40], [58, 52],
        [-64, 76], [-34, 86], [-6, 98], [20, 108], [60, 120],
        [-64, 144], [-34, 154], [-8, 166], [20, 176], [60, 188]
    ], {
        width: 6,
        height: 10
    });
}

function renderClusterBlock(root) {
    const group = centerRoot(800, 452, 1);

    const left = {
        tl: { x: -178, y: -20 },
        tr: { x: -78, y: -26 },
        br: { x: -72, y: 228 },
        bl: { x: -186, y: 232 }
    };

    const center = {
        tl: { x: -60, y: -262 },
        tr: { x: 66, y: -270 },
        br: { x: 74, y: 242 },
        bl: { x: -70, y: 234 }
    };

    const right = {
        tl: { x: 86, y: -132 },
        tr: { x: 178, y: -138 },
        br: { x: 182, y: 208 },
        bl: { x: 94, y: 202 }
    };

    drawSurface(group, left, {
        seed: 223,
        fill: 'url(#frontFill)',
        fillOpacity: 0.1,
        rows: 18,
        cols: 8,
        windows: 34,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.62
    });

    drawSurface(group, center, {
        seed: 239,
        fill: 'url(#sideFill)',
        fillOpacity: 0.11,
        rows: 34,
        cols: 10,
        windows: 76,
        windowWidth: 7,
        windowHeight: 10,
        strokeOpacity: 0.72
    });

    drawSurface(group, right, {
        seed: 251,
        fill: 'url(#frontFill)',
        fillOpacity: 0.1,
        rows: 24,
        cols: 7,
        windows: 46,
        windowWidth: 6,
        windowHeight: 10,
        strokeOpacity: 0.64
    });

    append(group, 'line', {
        x1: -140,
        y1: -24,
        x2: -24,
        y2: -30,
        stroke: '#7efcff',
        'stroke-opacity': 0.34,
        'stroke-width': 2,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: -24,
        y1: -30,
        x2: 106,
        y2: -26,
        stroke: '#7efcff',
        'stroke-opacity': 0.34,
        'stroke-width': 2,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: -136,
        y1: 52,
        x2: -18,
        y2: 52,
        stroke: '#7efcff',
        'stroke-opacity': 0.28,
        'stroke-width': 1.8,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: -12,
        y1: 28,
        x2: 106,
        y2: 30,
        stroke: '#7efcff',
        'stroke-opacity': 0.22,
        'stroke-width': 1.6,
        class: 'line-art'
    });

    const bridges = [
        [-72, -52, 66, -54],
        [-70, -8, 64, -10],
        [-68, 38, 68, 34]
    ];

    bridges.forEach(([x1, y1, x2, y2]) => {
        drawBridge(group, { x: x1, y: y1 }, { x: x2, y: y2 }, { opacity: 0.3, strokeWidth: 2, double: true });
    });

    drawColumnLights(group, [
        [-160, -8], [-126, -6], [-94, -4], [-60, -2], [-26, 0], [8, 2], [42, 4], [76, 6],
        [-166, 40], [-132, 38], [-98, 36], [-64, 34], [-30, 32], [4, 30], [38, 28], [72, 26],
        [-170, 86], [-136, 84], [-102, 82], [-68, 80], [-34, 78], [0, 76], [34, 74], [68, 72],
        [-174, 130], [-140, 128], [-106, 126], [-72, 124], [-38, 122], [-4, 120], [30, 118], [64, 116],
        [-178, 174], [-144, 172], [-110, 170], [-76, 168], [-42, 166], [-8, 164], [26, 162], [60, 160]
    ], {
        width: 7,
        height: 11
    });

    append(group, 'line', {
        x1: -28,
        y1: -292,
        x2: -28,
        y2: -270,
        stroke: '#7efcff',
        'stroke-opacity': 0.62,
        'stroke-width': 1.8,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 0,
        y1: -304,
        x2: 0,
        y2: -270,
        stroke: '#f7ffff',
        'stroke-opacity': 0.82,
        'stroke-width': 1.5,
        class: 'line-art'
    });

    append(group, 'line', {
        x1: 28,
        y1: -292,
        x2: 28,
        y2: -270,
        stroke: '#7efcff',
        'stroke-opacity': 0.62,
        'stroke-width': 1.8,
        class: 'line-art'
    });
}

const designs = [
    {
        name: 'Aster Spire',
        short: 'Aster',
        tagline: 'A slender glass tower with a rounded crown, tight mullion spacing, and a luminous vertical spine.',
        render: renderAsterSpire
    },
    {
        name: 'Terrace Stack',
        short: 'Terrace',
        tagline: 'A stepped high-rise with setback terraces, roof rails, and a heavier urban massing.',
        render: renderTerraceStack
    },
    {
        name: 'Twin Blade',
        short: 'Twin',
        tagline: 'A split vertical composition with twin fins, a narrow central core, and a strong bridge line.',
        render: renderTwinBlade
    },
    {
        name: 'Cantilever Crown',
        short: 'Cantilever',
        tagline: 'A grounded lower volume carrying an offset tower head with exposed structural braces.',
        render: renderCantileverCrown
    },
    {
        name: 'Prism Needle',
        short: 'Prism',
        tagline: 'A faceted needle tower with sharp edges, crystalline panels, and a tight apex.',
        render: renderPrismNeedle
    },
    {
        name: 'Cluster Block',
        short: 'Cluster',
        tagline: 'Three interlocked masses joined by suspended bridges and varied façade depths.',
        render: renderClusterBlock
    }
];

let currentIndex = 0;

function renderDesign(index) {
    const normalizedIndex = ((index % designs.length) + designs.length) % designs.length;
    currentIndex = normalizedIndex;

    stage.innerHTML = '';
    designs[normalizedIndex].render(stage);

    titleEl.textContent = designs[normalizedIndex].name;
    descriptionEl.textContent = designs[normalizedIndex].tagline;
    counterEl.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${String(designs.length).padStart(2, '0')}`;

    Array.from(controlsEl.querySelectorAll('button')).forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === normalizedIndex);
        button.setAttribute('aria-pressed', String(buttonIndex === normalizedIndex));
    });
}

function createControls() {
    controlsEl.innerHTML = '';

    designs.forEach((design, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${String(index + 1).padStart(2, '0')} ${design.short}`;
        button.title = design.tagline;
        button.addEventListener('click', () => renderDesign(index));
        controlsEl.appendChild(button);
    });
}

function stepDesign(delta) {
    renderDesign(currentIndex + delta);
}

function handleWheel(event) {
    event.preventDefault();

    if (event.deltaY > 0) {
        stepDesign(1);
    } else if (event.deltaY < 0) {
        stepDesign(-1);
    }
}

function handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        stepDesign(1);
        return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        stepDesign(-1);
        return;
    }

    if (event.key === 'Home') {
        event.preventDefault();
        renderDesign(0);
        return;
    }

    if (event.key === 'End') {
        event.preventDefault();
        renderDesign(designs.length - 1);
    }
}

prevButton.addEventListener('click', () => stepDesign(-1));
nextButton.addEventListener('click', () => stepDesign(1));
window.addEventListener('wheel', handleWheel, { passive: false });
document.addEventListener('keydown', handleKeydown);

createControls();
renderDesign(0);
