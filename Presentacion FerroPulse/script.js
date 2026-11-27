/**
 * FERROPULSE — PRESENTATION DECK CONTROLLER (script.js)
 * - Renderizado Pixel-Art Responsive de Tilesheet Solidos.png (416x160px) con piso/techo anclados al píxel
 * - Fe26 caminando exactamente sobre el borde superior de las losas del piso (compensando los 11px transparentes del frame 84x84)
 * - Controlador de diapositivas y sub-pasos por Click, Enter, Espacio, Flechas (→ / ←)
 * - Secuencia automática espaciada por tiempo en Slide 3 (High Concept)
 * - Timecode de cámara de seguridad en vivo y QR para la Demo de itch.io
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. ESTADO DE NAVEGACIÓN DE DIAPOSITIVAS Y PASOS
    // =========================================================================
    const slides = Array.from(document.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    let currentSlideIndex = 0;
    let currentStep = 0;
    let autoSequenceTimers = [];

    const bgFe26Actor = document.getElementById('bg-fe26-actor');

    function clearAutoTimers() {
        autoSequenceTimers.forEach((t) => clearTimeout(t));
        autoSequenceTimers = [];
    }

    function runSlide3AutoSequence() {
        clearAutoTimers();
        const p1 = document.getElementById('pillar-1');
        const p2 = document.getElementById('pillar-2');
        const p3 = document.getElementById('pillar-3');
        const p4 = document.getElementById('pillar-4');
        [p1, p2, p3, p4].forEach((el) => el && el.classList.remove('pillar-active'));

        // Aparecen solas espaciadas por tiempo: Precision -> Sci-Fi Industrial -> Shapeshifting
        autoSequenceTimers.push(setTimeout(() => p1 && p1.classList.add('pillar-active'), 850));
        autoSequenceTimers.push(setTimeout(() => p2 && p2.classList.add('pillar-active'), 2100));
        autoSequenceTimers.push(setTimeout(() => p3 && p3.classList.add('pillar-active'), 3350));
        autoSequenceTimers.push(setTimeout(() => p4 && p4.classList.add('pillar-active'), 4400));
    }

    function updateSlideStepVisuals(slideEl, step) {
        const slideNum = parseInt(slideEl.getAttribute('data-slide'), 10);

        const revealItems = slideEl.querySelectorAll('.reveal-step');
        revealItems.forEach((item) => {
            const reqStep = parseInt(item.getAttribute('data-step'), 10);
            if (step >= reqStep) {
                item.classList.add('step-visible');
            } else {
                item.classList.remove('step-visible');
            }
        });

        // Slide 5: Cambio de estado Sólido (0) -> Líquido (1) -> Eléctrico (2)
        if (slideNum === 5) {
            const tabs = slideEl.querySelectorAll('[data-state-tab]');
            const panels = slideEl.querySelectorAll('[data-state-panel]');
            tabs.forEach((tab) => {
                const idx = parseInt(tab.getAttribute('data-state-tab'), 10);
                tab.classList.toggle('active', idx === step);
            });
            panels.forEach((panel) => {
                const idx = parseInt(panel.getAttribute('data-state-panel'), 10);
                panel.classList.toggle('active-state', idx === step);
            });
        }

        // Slide 6: Vistas de Arte (0: Escalas y Paleta, 1: Referencias, 2: Atmósfera y VFX)
        if (slideNum === 6) {
            const artTabs = slideEl.querySelectorAll('[data-art-tab]');
            const artPanels = slideEl.querySelectorAll('[data-art-panel]');
            artTabs.forEach((tab) => {
                const idx = parseInt(tab.getAttribute('data-art-tab'), 10);
                tab.classList.toggle('active', idx === step);
            });
            artPanels.forEach((panel) => {
                const idx = parseInt(panel.getAttribute('data-art-panel'), 10);
                panel.classList.toggle('active-state', idx === step);
            });
        }
    }

    function updateHUD() {
        const activeSlide = slides[currentSlideIndex];
        const showBgActor = activeSlide.getAttribute('data-bg-actor') === 'true';
        if (bgFe26Actor) {
            bgFe26Actor.classList.toggle('hidden-actor', !showBgActor);
        }
    }

    function goToSlide(index, initialStep = 0) {
        if (index < 0 || index >= totalSlides) return;

        const trailerVid = document.getElementById('trailer-video');
        if (trailerVid && !trailerVid.paused) {
            trailerVid.pause();
        }

        clearAutoTimers();
        slides.forEach((s, idx) => {
            s.classList.toggle('active', idx === index);
        });

        currentSlideIndex = index;
        const activeSlide = slides[currentSlideIndex];
        const maxSteps = parseInt(activeSlide.getAttribute('data-max-steps') || '0', 10);
        currentStep = Math.max(0, Math.min(initialStep, maxSteps));

        updateSlideStepVisuals(activeSlide, currentStep);
        updateHUD();

        if (activeSlide.getAttribute('data-auto-sequence') === 'true') {
            runSlide3AutoSequence();
        }
    }

    function advanceNext() {
        const activeSlide = slides[currentSlideIndex];
        const maxSteps = parseInt(activeSlide.getAttribute('data-max-steps') || '0', 10);

        if (currentStep < maxSteps) {
            currentStep++;
            updateSlideStepVisuals(activeSlide, currentStep);
            updateHUD();
        } else if (currentSlideIndex < totalSlides - 1) {
            goToSlide(currentSlideIndex + 1, 0);
        }
    }

    function goBackPrev() {
        const activeSlide = slides[currentSlideIndex];
        if (currentStep > 0) {
            currentStep--;
            updateSlideStepVisuals(activeSlide, currentStep);
            updateHUD();
        } else if (currentSlideIndex > 0) {
            const prevSlide = slides[currentSlideIndex - 1];
            const prevMax = parseInt(prevSlide.getAttribute('data-max-steps') || '0', 10);
            goToSlide(currentSlideIndex - 1, prevMax);
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            advanceNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
            e.preventDefault();
            goBackPrev();
        }
    });

    window.addEventListener('click', (e) => {
        const interactive = e.target.closest('a, button, video, input, label, [data-state-tab], [data-art-tab]');
        if (interactive) return;
        advanceNext();
    });

    document.querySelectorAll('[data-state-tab]').forEach((tab) => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const stepIdx = parseInt(tab.getAttribute('data-state-tab'), 10);
            currentStep = stepIdx;
            updateSlideStepVisuals(slides[currentSlideIndex], currentStep);
            updateHUD();
        });
    });

    document.querySelectorAll('[data-art-tab]').forEach((tab) => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const stepIdx = parseInt(tab.getAttribute('data-art-tab'), 10);
            currentStep = stepIdx;
            updateSlideStepVisuals(slides[currentSlideIndex], currentStep);
            updateHUD();
        });
    });

    // =========================================================================
    // 2. RENDERIZADOR CANVAS RESPONSIVE DE "Tilesheet Solidos.png" (416x160px)
    //    Anclando Techo arriba (y = 0) y Piso abajo (y = H - TILE_SIZE) sin recortes
    // =========================================================================
    const tileCanvas = document.getElementById('tilemap-canvas');
    const tilesetImg = new Image();
    tilesetImg.src = 'Recursos/assets/Tilesheet Solidos.png';

    // Coordenadas exactas de 32x32 dentro de Tilesheet Solidos.png (416x160px)
    const TILES = {
        // Paredes finas verticales
        THIN_V_TOP:    { x: 0,   y: 0  }, // de (0,0) a (32,32): puntas que miran arriba en paredes finas verticales
        THIN_V_MID:    { x: 0,   y: 32 }, // de (0,32) a (32,64): cuerpo de pared fina vertical
        THIN_V_BOT:    { x: 0,   y: 64 }, // de (0,64) a (32,96): puntas que miran abajo en paredes finas verticales

        // Pisos, esquinas, muros e interior
        CORNER_UP_L:   { x: 64,  y: 0  }, // de (64,0) a (96,32): esquinas que apuntan hacia arriba a la izquierda
        FLOOR_TOP:     { x: 96,  y: 0  }, // de (96,0) a (128,32): pisos, donde el jugador camina
        CORNER_UP_R:   { x: 128, y: 0  }, // de (128,0) a (160,32): esquinas que apuntan hacia arriba a la derecha

        WALL_FACE_L:   { x: 64,  y: 32 }, // de (64,32) a (96,64): paredes que miran a la izquierda (a la derecha del jugador)
        WALL_INSIDE:   { x: 96,  y: 32 }, // de (96,32) a (128,64): interior de los muros
        WALL_FACE_R:   { x: 128, y: 32 }, // de (128,32) a (160,64): paredes que miran a la derecha (a la izquierda del jugador)

        CORNER_DOWN_L: { x: 64,  y: 64 }, // de (64,64) a (96,96): esquinas que apuntan hacia abajo a la izquierda
        CEILING:       { x: 96,  y: 64 }, // de (96,64) a (128,96): techos
        CORNER_DOWN_R: { x: 128, y: 64 }, // de (128,64) a (160,96): esquinas que apuntan hacia abajo a la derecha

        // Plataformas horizontales finas
        PLAT_H_LEFT:   { x: 64,  y: 128 }, // de (64,128) a (96,160): punta que mira a la izquierda
        PLAT_H_MID:    { x: 96,  y: 128 }, // de (96,128) a (128,160): parte del medio
        PLAT_H_RIGHT:  { x: 128, y: 128 }  // de (128,128) a (160,160): punta que mira a la derecha
    };

    function drawTileAtPixel(ctx, tileDef, px, py, tileSize) {
        ctx.drawImage(
            tilesetImg,
            tileDef.x, tileDef.y, 32, 32,
            Math.round(px), Math.round(py), tileSize, tileSize
        );
    }

    function renderLabTilemap() {
        if (!tileCanvas || !tilesetImg.complete || tilesetImg.naturalWidth === 0) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        tileCanvas.width = W;
        tileCanvas.height = H;

        // Escala responsive entera para conservar Pixel Art perfecto:
        // Pantallas chicas (< 720px de alto o < 900px ancho) -> SCALE 1.5 o 2; FullHD -> SCALE 2
        const SCALE = (H < 640 || W < 820) ? 1.5 : 2;
        const TILE_SIZE = Math.round(32 * SCALE);

        const ctx = tileCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);

        // Cantidad de columnas horizontales
        const cols = Math.ceil(W / TILE_SIZE);
        // Coordenada X de la pared derecha anclada exactamente al borde derecho
        const rightWallX = W - TILE_SIZE;

        // Coordenadas Y exactas:
        // Techo anclado en Y = 0
        const ceilingY = 0;
        // Piso anclado exactamente al borde inferior visible (H - TILE_SIZE)
        const floorY = H - TILE_SIZE;

        // 1. DIBUJAR MUROS LATERALES (desde debajo del techo hasta encima del piso)
        for (let y = TILE_SIZE; y < floorY; y += TILE_SIZE) {
            // Pared izquierda (está a la izquierda del jugador -> mira a la derecha: 128,32)
            drawTileAtPixel(ctx, TILES.WALL_FACE_R, 0, y, TILE_SIZE);
            // Pared derecha (está a la derecha del jugador -> mira a la izquierda: 64,32)
            drawTileAtPixel(ctx, TILES.WALL_FACE_L, rightWallX, y, TILE_SIZE);
        }

        // 2. DIBUJAR TECHO COMPLETO EN Y = 0 (con sus esquinas de transición a las paredes)
        drawTileAtPixel(ctx, TILES.CORNER_DOWN_R, 0, ceilingY, TILE_SIZE);
        for (let x = TILE_SIZE; x < rightWallX; x += TILE_SIZE) {
            drawTileAtPixel(ctx, TILES.CEILING, x, ceilingY, TILE_SIZE);
        }
        drawTileAtPixel(ctx, TILES.CORNER_DOWN_L, rightWallX, ceilingY, TILE_SIZE);

        // 3. DIBUJAR PISO COMPLETO EN Y = H - TILE_SIZE (donde camina Fe26)
        drawTileAtPixel(ctx, TILES.CORNER_UP_R, 0, floorY, TILE_SIZE);
        for (let x = TILE_SIZE; x < rightWallX; x += TILE_SIZE) {
            drawTileAtPixel(ctx, TILES.FLOOR_TOP, x, floorY, TILE_SIZE);
        }
        drawTileAtPixel(ctx, TILES.CORNER_UP_L, rightWallX, floorY, TILE_SIZE);

        // 4. PLATAFORMAS HORIZONTALES FINAS Y PARED VERTICAL FINA (proporcionales al viewport)
        if (cols >= 10 && H >= 480) {
            // Plataforma horizontal izquierda a ~62% de la altura
            const plat1Y = Math.round((floorY * 0.62) / TILE_SIZE) * TILE_SIZE;
            const plat1X = TILE_SIZE * 2;
            drawTileAtPixel(ctx, TILES.PLAT_H_LEFT,  plat1X,                 plat1Y, TILE_SIZE);
            drawTileAtPixel(ctx, TILES.PLAT_H_MID,   plat1X + TILE_SIZE,     plat1Y, TILE_SIZE);
            drawTileAtPixel(ctx, TILES.PLAT_H_MID,   plat1X + TILE_SIZE * 2, plat1Y, TILE_SIZE);
            drawTileAtPixel(ctx, TILES.PLAT_H_RIGHT, plat1X + TILE_SIZE * 3, plat1Y, TILE_SIZE);

            // Plataforma horizontal derecha a ~36% de la altura
            const plat2Y = Math.round((floorY * 0.36) / TILE_SIZE) * TILE_SIZE;
            const plat2X = rightWallX - TILE_SIZE * 6;
            if (plat2X > plat1X + TILE_SIZE * 3) {
                drawTileAtPixel(ctx, TILES.PLAT_H_LEFT,  plat2X,                 plat2Y, TILE_SIZE);
                drawTileAtPixel(ctx, TILES.PLAT_H_MID,   plat2X + TILE_SIZE,     plat2Y, TILE_SIZE);
                drawTileAtPixel(ctx, TILES.PLAT_H_MID,   plat2X + TILE_SIZE * 2, plat2Y, TILE_SIZE);
                drawTileAtPixel(ctx, TILES.PLAT_H_RIGHT, plat2X + TILE_SIZE * 3, plat2Y, TILE_SIZE);
            }

            // Pared fina vertical suspendida en segundo plano
            const thinColX = Math.round((W * 0.74) / TILE_SIZE) * TILE_SIZE;
            const thinTopY = TILE_SIZE * 2;
            if (thinTopY + TILE_SIZE * 3 < floorY - TILE_SIZE) {
                drawTileAtPixel(ctx, TILES.THIN_V_TOP, thinColX, thinTopY,                 TILE_SIZE);
                drawTileAtPixel(ctx, TILES.THIN_V_MID, thinColX, thinTopY + TILE_SIZE,     TILE_SIZE);
                drawTileAtPixel(ctx, TILES.THIN_V_BOT, thinColX, thinTopY + TILE_SIZE * 2, TILE_SIZE);
            }
        }

        // 5. ALINEAR A FE26 AL PÍXEL EXACTO SOBRE LA SUPERFICIE DEL PISO
        // En solid_walk.png cada frame es de 84x84px y hay 13 píxeles transparentes entre los pies (Y=71) y el borde inferior (Y=84).
        // Con transform-origin: top left en .fe26-bg-sprite, el sprite escalado mide (84 * SCALE) de alto hacia abajo desde el tope de #bg-fe26-actor.
        // Fijamos el ancho/alto de #bg-fe26-actor exactamente a (84 * SCALE) para que su borde inferior coincida con el borde inferior del sprite escalado,
        // y colocamos bottom = TILE_SIZE - (13 * SCALE) para que los pies apoyen exactamente sobre la superficie superior del tile del piso.
        if (bgFe26Actor) {
            const fe26Sprite = bgFe26Actor.querySelector('.fe26-bg-sprite');
            const scaledBox = Math.round(84 * SCALE);
            const emptyFootMarginPx = Math.round(13 * SCALE);
            const bottomCssPx = TILE_SIZE - emptyFootMarginPx;

            bgFe26Actor.style.width = `${scaledBox}px`;
            bgFe26Actor.style.height = `${scaledBox}px`;
            bgFe26Actor.style.bottom = `${bottomCssPx}px`;

            if (fe26Sprite) {
                fe26Sprite.style.transformOrigin = 'top left';
                fe26Sprite.style.transform = `scale(${SCALE})`;
            }
        }
    }

    tilesetImg.addEventListener('load', renderLabTilemap);
    window.addEventListener('resize', renderLabTilemap);
    if (tilesetImg.complete) {
        renderLabTilemap();
    }

    // =========================================================================
    // 3. TIMECODE DE CÁMARA EN VIVO
    // =========================================================================
    const timecodeEl = document.getElementById('cam-timecode');
    const startTime = Date.now();

    function updateTimecode() {
        if (!timecodeEl) return;
        const elapsed = Date.now() - startTime;
        const totalSec = Math.floor(elapsed / 1000);
        const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
        const secs = String(totalSec % 60).padStart(2, '0');
        const frames = String(Math.floor((elapsed % 1000) / 41.6)).padStart(2, '0');
        timecodeEl.textContent = `00:${mins}:${secs}:${frames}`;
        requestAnimationFrame(updateTimecode);
    }
    requestAnimationFrame(updateTimecode);

    // =========================================================================
    // 4. REPRODUCTOR DE TRÁILER (SLIDE 11)
    // =========================================================================
    const trailerVideo = document.getElementById('trailer-video');
    const trailerOverlay = document.getElementById('trailer-placeholder-overlay');
    const btnPlayTrailer = document.getElementById('btn-play-trailer');

    if (btnPlayTrailer && trailerVideo) {
        btnPlayTrailer.addEventListener('click', (e) => {
            e.stopPropagation();
            trailerOverlay.classList.add('hidden');
            trailerVideo.play();
        });

        trailerVideo.addEventListener('play', () => {
            trailerOverlay.classList.add('hidden');
        });
    }

    // =========================================================================
    // 5. CÓDIGO QR REAL (ISO/IEC 18004 V3-L) PARA https://31perseus.itch.io/ferropulse
    // =========================================================================
    function drawItchQRCode() {
        const canvases = [
            document.getElementById('qr-canvas'),
            document.getElementById('qr-canvas-final')
        ].filter(Boolean);
        if (canvases.length === 0) return;

        // Matriz QR V3-L (29x29) con Reed-Solomon EC (15 codewords) y BCH format info 0x77c4
        // codificando exactamente: https://31perseus.itch.io/ferropulse
        const qrRows = [
            '11111110001000101111101111111',
            '10000010010001011011001000001',
            '10111010100100100010101011101',
            '10111010010011010010001011101',
            '10111010010011110111001011101',
            '10000010001110111101101000001',
            '11111110101010101010101111111',
            '00000000100100000110000000000',
            '11101111100010000100111000100',
            '00010001010111001000101001001',
            '01100011001110101100101110111',
            '01110100011011111111111000010',
            '01110110101100111110011001011',
            '11011100011100101000101001001',
            '11001010011001000100001011011',
            '01001100100100011111001101010',
            '00011111100010000101111101011',
            '00111101000111001100111001101',
            '10100010101110101100111110011',
            '01001001111011110100100101010',
            '10101110010100100101111110000',
            '00000000111100101101100010111',
            '11111110110001000001101011011',
            '10000010111100001111100011010',
            '10111010111010011100111110011',
            '10111010001111001110100010111',
            '10111010100110101110110011001',
            '10000010101011100100100011010',
            '11111110101100100101111011011'
        ];
        const size = qrRows.length;

        canvases.forEach((canvas) => {
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            const cell = Math.floor(canvas.width / (size + 2));
            const offset = Math.floor((canvas.width - cell * size) / 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#040809';
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (qrRows[r][c] === '1') {
                        ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
                    }
                }
            }
        });
    }

    drawItchQRCode();
    goToSlide(0, 0);
})();
