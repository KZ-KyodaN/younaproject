// ==========================
// CONFIG
// ==========================
const OSU_AUDIO = "audio.mp3";     
const OSU_MAP   = "backstabber.osu"; 

// ==========================
// GLOBALS
// ==========================
let isFinished = false;
let canvas, ctx, overlay;
let audio;
let hitObjects = [];
let difficulty = { CS: 4, AR: 9, OD: 8, sliderMultiplier: 1.4 };

let gameStartTime = null;   // момент, когда НОТЫ начинают идти (после отсчёта)
let animId = 0;
let score = 0;
let combo = 0;
let misses = 0;
let isRunning = false;

let hitWindow300 = 80;
let missWindow = 200;

let preempt = 1200;         // зависит от AR
let approachScale = 3;      // насколько больше approach circle
let circleRadius = 60;      // зависит от CS

// курсор
let cursorX = 0;
let cursorY = 0;
let cursorListenerMove;
let cursorListenerClick;
let keydownListener;

// ==========================
// PUBLIC START FUNCTION
// ==========================
function startOsuGame() {
    if (isRunning) return;
    isRunning = true;

    createOverlay();
    createCanvas();
    loadAudio();
    loadMap().then(() => {
        setupDifficultyParams();
        startCountdownAndGame();
    }).catch(err => {
        console.error("Failed to load osu map:", err);
        stopGame();
    });
}

window.startOsuGame = startOsuGame;

// ==========================
// UI / OVERLAY
// ==========================
function createOverlay() {
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "9999";
    overlay.style.background = "rgba(0,0,0,0.9)";
    overlay.style.backdropFilter = "blur(10px)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.userSelect = "none";
    overlay.style.cursor = "none";
    document.body.appendChild(overlay);

    keydownListener = e => {
        if (e.key === "Escape") {
            stopGame();
        }
    };
    document.addEventListener("keydown", keydownListener);
}

function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.width = 1024;  // 512*2
    canvas.height = 768;  // 384*2
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.style.borderRadius = "16px";
    canvas.style.boxShadow = "0 0 40px rgba(255,58,167,0.8)";
    overlay.appendChild(canvas);
    ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    cursorX = canvas.width / 2;
    cursorY = canvas.height / 2;

    cursorListenerMove = e => {
        const r = canvas.getBoundingClientRect();
        cursorX = (e.clientX - r.left) * (canvas.width / r.width);
        cursorY = (e.clientY - r.top) * (canvas.height / r.height);
    };

    cursorListenerClick = e => {
        const r = canvas.getBoundingClientRect();
        const mx = (e.clientX - r.left) * (canvas.width / r.width);
        const my = (e.clientY - r.top) * (canvas.height / r.height);
        handleHit(mx, my);
    };

    canvas.addEventListener("mousemove", cursorListenerMove);
    canvas.addEventListener("mousedown", cursorListenerClick);
}

// ==========================
// LOADERS
// ==========================
function loadAudio() {
    audio = new Audio(OSU_AUDIO);
    audio.volume = 1;
        audio.loop = false;
    audio.onended = null;
}

async function loadMap() {
    const text = await (await fetch(OSU_MAP)).text();
    parseDifficulty(text);
    parseHitObjects(text);
}

// ==========================
// PARSERS
// ==========================
function parseDifficulty(text) {
    const lines = text.split(/\r?\n/);
    const idx = lines.indexOf("[Difficulty]");
    if (idx === -1) return;

    for (let i = idx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("[")) break;

        const [key, value] = line.split(":").map(s => s.trim());
        if (!key) continue;
        const v = parseFloat(value);

        if (key === "CircleSize") difficulty.CS = v;
        if (key === "OverallDifficulty") difficulty.OD = v;
        if (key === "ApproachRate") difficulty.AR = v;
        if (key === "SliderMultiplier") difficulty.sliderMultiplier = v;
    }
}

function parseHitObjects(text) {
    const lines = text.split(/\r?\n/);
    const idx = lines.indexOf("[HitObjects]");
    if (idx === -1) return;

    const hitLines = lines.slice(idx + 1).filter(l => l.trim().length > 0 && !l.startsWith("["));

    const playW = 512;
    const playH = 384;
    const scaleX = canvas.width / playW;
    const scaleY = canvas.height / playH;

    hitObjects = hitLines.map(line => {
        const parts = line.split(",");
        const x = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);
        const time = parseInt(parts[2], 10);
        const type = parseInt(parts[3], 10);

        const isCircle = (type & 1) !== 0;
        const isSlider = (type & 2) !== 0;

        let sliderPoints = null;

        if (isSlider) {
            const curveData = parts[5]; // вида "P|92:335|82:295"
            const segments = curveData.split("|");
            // первая буква - тип кривой: P, L, B...
            segments.shift();
            sliderPoints = segments.map(p => {
                const [sx, sy] = p.split(":").map(n => parseInt(n, 10));
                return { x: sx * scaleX, y: sy * scaleY };
            });
        }

        return {
            x: x * scaleX,
            y: y * scaleY,
            time,
            type,
            isCircle,
            isSlider,
            sliderPoints,
            hit: false,
            miss: false
        };
    });

    hitObjects.sort((a, b) => a.time - b.time);
}

// ==========================
// DIFFICULTY-BASED PARAMS
// ==========================
function setupDifficultyParams() {
    const cs = difficulty.CS ?? 4;
    const radiusOsu = 54.4 - 4.48 * cs; // на 512x384
    const scaleX = canvas.width / 512;
    circleRadius = radiusOsu * scaleX;

    // OD -> hit windows (упрощенно, только окно хита и мисса)
    const od = difficulty.OD ?? 8;
    hitWindow300 = Math.max(15, 80 - 6 * od);        // 300 hit
    missWindow = Math.max(30, 200 - 10 * od);       // после этого считаем мисс

    // AR -> preempt
    const ar = (difficulty.AR ?? cs);
    if (ar <= 5) {
        preempt = 1200 + 600 * (5 - ar) / 5;
    } else {
        preempt = 1200 - 750 * (ar - 5) / 5;
    }
    // approachScale = 3 остаётся
}

// ==========================
// COUNTDOWN + GAME START
// ==========================
function startCountdownAndGame() {
    const now = performance.now();
    const countdownMs = 5000; 
    gameStartTime = now + countdownMs;

    setTimeout(() => {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Audio play error:", err));
    }, countdownMs);

    loop();
}

// ==========================
// GAME LOOP
// ==========================
function loop() {
    const now = performance.now();

    if (!gameStartTime) {
        animId = requestAnimationFrame(loop);
        return;
    }

    const t = now - gameStartTime; 
if (!isFinished && hitObjects.length) {
    const lastObjTime = hitObjects[hitObjects.length - 1].time;
    if (t > lastObjTime + missWindow + 1000) { // +1 сек запас
        showResultScreen();
        return; // больше не рисуем обычный фрейм
    }
}

    drawFrame(t);

    animId = requestAnimationFrame(loop);
}

// ==========================
// HIT DETECTION
// ==========================
function handleHit(mx, my) {
    if (!hitObjects.length || !gameStartTime) return;

    const now = performance.now();
    const t = now - gameStartTime;

    let bestObj = null;
    let bestDelta = Infinity;

    for (const obj of hitObjects) {
        if (obj.hit || obj.miss) continue;

        const dt = Math.abs(obj.time - t);
        if (dt > hitWindow300) continue; // слишком рано/поздно

        // расстояние до head ноты
        const dx = obj.x - mx;
        const dy = obj.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= circleRadius && dt < bestDelta) {
            bestDelta = dt;
            bestObj = obj;
        }
    }

    if (bestObj) {
        bestObj.hit = true;
        score += 300;
        combo++;
    }
}

// ==========================
// DRAW
// ==========================
function drawFrame(t) {
    // фон
    ctx.fillStyle = "#05020c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // лёгкий градиент для стиля
    const grad = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.1, 40,
        canvas.width * 0.7, canvas.height * 0.8, canvas.width * 0.9
    );
    grad.addColorStop(0, "rgba(255,58,167,0.2)");
    grad.addColorStop(1, "rgba(5,2,15,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // если ещё идёт отсчёт (t < 0)
    if (t < 0) {
        drawCountdown(-t);
        drawCursor();
        return;
    }

    const fadeOut = 400; // ms после time, когда нота исчезает

    for (const obj of hitObjects) {
        if (obj.hit || obj.miss) continue;

        const dt = t - obj.time;

        // мисс по времени
        if (dt > missWindow && !obj.hit) {
            obj.miss = true;
            misses++;
            combo = 0;
            continue;
        }

        // ещё слишком рано для появления
        if (dt < -preempt) continue;

        const alpha = dt < 0
            ? 1 // до удара полностью видим
            : Math.max(0, 1 - dt / fadeOut);

        // рисуем слайдер путь (упрощённо)
        if (obj.isSlider && obj.sliderPoints && obj.sliderPoints.length > 0) {
            drawSliderPath(obj, alpha * 0.65);
        }

        // сам круг
        drawHitCircle(obj, alpha, dt);
    }

    drawUI();
    drawCursor();
    function showResultScreen() {
    isFinished = true;
    cancelAnimationFrame(animId);

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ffffff";
    ctx.font = "42px Space Grotesk";
    ctx.fillText("Поздравляю!", canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = "24px Space Grotesk";
    ctx.fillText(`Количество миссов: ${misses}`, canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText(`Очки: ${score}`, canvas.width / 2, canvas.height / 2 + 30);

    ctx.font = "20px Space Grotesk";
    ctx.fillStyle = "#ff3aa7";
    ctx.fillText(
        "Я не знаю, зачем ты сыграл в это, но спасибо",
        canvas.width / 2,
        canvas.height / 2 + 80
    );
}

}

function drawCountdown(remainingMs) {
    const s = Math.ceil(remainingMs / 1000); // 5..1
    const text = s > 0 ? String(s) : "GO!";

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "72px Space Grotesk";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function drawHitCircle(obj, alpha, dt) {
    const r = circleRadius;

    // подходящий круг (approach circle)
    if (dt < 0 && dt >= -preempt) {
        const progress = 1 - (-dt / preempt); // 0 -> появление, 1 -> момент хита
        const approachR = r * (1 + approachScale * (1 - progress)); // большой -> маленький

        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(255,58,167,${alpha * 0.6})`;
        ctx.arc(obj.x, obj.y, approachR, 0, Math.PI * 2);
        ctx.stroke();
    }

    // основной круг
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(168,85,255,${alpha})`;
    ctx.arc(obj.x, obj.y, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

function drawSliderPath(obj, alpha) {
    if (!obj.sliderPoints || obj.sliderPoints.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    for (const p of obj.sliderPoints) {
        ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = `rgba(175,129,239,${alpha})`;
    ctx.lineWidth = circleRadius * 0.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
}

function drawUI() {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Space Grotesk";
    ctx.fillText(`Score: ${score}`, 20, 40);

    ctx.fillText(`Combo: ${combo}`, 20, 80);

    ctx.fillStyle = "#ff3aa7";
    ctx.fillText(`Miss: ${misses}`, 20, 120);
}

function drawCursor() {
    ctx.save();
    ctx.translate(cursorX, cursorY);

    // внешнее кольцо
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();

    // внутренняя точка
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,58,167,0.9)";
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
document.addEventListener("keydown", function(e) {
    if (e.repeat) return; // игнорируем удержание

    if (e.key === "z" || e.key === "Z" || e.key === "x" || e.key === "X") {
        handleHit(cursorX, cursorY);
    }
});


// ==========================
// STOP / CLEANUP
// ==========================
function stopGame() {
    cancelAnimationFrame(animId);

if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    audio.onended = null;
}


    if (canvas) {
        canvas.removeEventListener("mousemove", cursorListenerMove);
        canvas.removeEventListener("mousedown", cursorListenerClick);
    }

    if (overlay) {
        overlay.remove();
    }

    if (keydownListener) {
        document.removeEventListener("keydown", keydownListener);
    }

    // reset
    hitObjects = [];
    score = 0;
    combo = 0;
    misses = 0;
    isRunning = false;
    gameStartTime = null;
}
