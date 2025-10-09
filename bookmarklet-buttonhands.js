/* 
 * Bookmarklet: Interaktiver Button-Auto-Klick-Cursor mit SVG-Overlay
 * Features:
 * - Jede Instanz läuft unabhängig
 * - SVG-Cursor (Pfeil/Hand), per Touch/Mouse bewegbar
 * - Button-Erkennung via Timer
 * - Klick auf Button unter Cursor (mit Ton + visuellem Feedback)
 * - Rückstandslose Selbstentfernung durch Klick auf Cursor
 * - Debug-Modus mit Alerts + Konsole
 * SVG enthält beide Darstellungen ("pointer-arrow", "pointer-hand")
 * 
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-10-09
 * Version: 1.0
 */
/* 
 * Bookmarklet: Interaktiver Button-Auto-Klick-Cursor mit SVG-Overlay
 * Verbesserungen:
 * - Cursor bleibt nach Drag bestehen (Klick ≠ Drag)
 * - 4x größerer Cursor
 * - Rahmen aus SVG entfernt
 * 
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-10-09
 * Version: 1.1
 */

(function () {
  const DEBUG = false;

  const instanceId = `bookmarklet_cursor_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const overlayId = `overlay_${instanceId}`;
  const svgId = `svg_${instanceId}`;
  const CHECK_INTERVAL = 1000;
  const TONE_DURATION = 500;
  const TONE_FREQUENCY = 220;

  let dragging = false;
  let moved = false;
  let dragOffset = { x: 0, y: 0 };
    let pointerOffset = { x: 40, y: 10 };
  let timerId = null;
  let currentCursor = null;
  let lastClickedButton = null;

  // Neu: Set, um bereits geloggte Buttons zu tracken
  const loggedButtons = new Set();

  function log(...args) {
    if (DEBUG) console.log(`[${instanceId}]`, ...args);
  }

  function alertDebug(message) {
    if (DEBUG) alert(`[${instanceId}]\n${message}`);
  }


  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 0 20 24" style="width:100%; height:100%;">


  <g id="pointer-arrow">
    <path class="path-outline" fill="#fff" stroke="none" d="M1 3h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v2H9v1h1v2h1v2h-1v1H8v-1H7v-2H6v-2H5v1H4v1H3v1H1"/>
    <path class="path-inner" fill="#000" stroke="none" d="M2 5h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1H8v2h1v2h1v2H8v-2H7v-2H6v-1H5v1H4v1H3v1H2"/>
      
  </g>
  <g id="pointer-hand" transform="translate(-20,0)" style="display: none;">
    <path class="path-outline" fill="#000" stroke="none" d="M19 1h2v1h1v4h2v1h3v1h2v1h1v1h1v7h-1v3h-1v3H19v-3h-1v-2h-1v-2h-1v-2h-1v-1h-1v-3h3v1h1V2h1"/>
    <path class="path-inner" fill="#fff" stroke="none"  d="M21 2v9h1V7h2v4h1V8h2v4h1V9h1v1h1v7h-1v3h-1v2h-8v-2h-1v-2h-1v-2h-1v-2h-1v-1h-1v-2h2v1h1v1h1V2"/>
  </g>
</svg>`;

  function createCursorOverlay() {
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.position = 'fixed';
    overlay.style.top = '100px';
    overlay.style.left = '100px';
    overlay.style.zIndex = 999999;
    overlay.style.cursor = 'pointer';
    overlay.style.width = '128px';
    overlay.style.height = '96px';
    overlay.style.userSelect = 'none';
    overlay.style.background = 'none';  // <-- hier transparent statt weiß
    overlay.style.border = 'none';             // kein Rahmen
    overlay.style.outline = 'none';            // kein Outline
    overlay.style.transform = 'scale(1)';
    overlay.innerHTML = svgString;
    //overlay.style.shapeRenderer= "geometricPrecision";
    document.body.appendChild(overlay);

    const svg = overlay.querySelector('svg');
    svg.id = svgId;
    svg.style.pointerEvents = 'none'; // Mausereignisse durchreichen
    svg.style.shapeRenderer= "pixelated";
    currentCursor = overlay;

    overlay.addEventListener('mousedown', startDrag);
    overlay.addEventListener('touchstart', startDrag, { passive: false });

    overlay.addEventListener('click', (e) => {
      if (!moved) {
        log('Cursor clicked – removing instance');
        removeInstance();
      }
      moved = false;
    });

    return overlay;
  }

  function startDrag(e) {
    dragging = true;
    moved = false;
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    const rect = currentCursor.getBoundingClientRect();
    dragOffset.x = startX - rect.left;
    dragOffset.y = startY - rect.top;

    function onMove(ev) {
      const x = ev.clientX || ev.touches[0].clientX;
      const y = ev.clientY || ev.touches[0].clientY;
      currentCursor.style.left = `${x - dragOffset.x}px`;
      currentCursor.style.top = `${y - dragOffset.y}px`;
      let pos = getCursorPosition();
          if (DEBUG) console.log(`Cursor moved to x:${pos.x}px, y:${pos.y}px`);

      moved = true;
    }


    function onEnd() {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }



  function getCursorPosition() {
    const rect = currentCursor.getBoundingClientRect();
    return {
      x: rect.left + pointerOffset.x,  // 10px von links
      y: rect.top + pointerOffset.y,   // 10px von oben
    };
   
  }

  function switchCursorMode(toHand = true) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const arrow = svg.querySelector('#pointer-arrow');
    const hand = svg.querySelector('#pointer-hand');
    if (toHand) {
      arrow.style.display = 'none';
      hand.style.display = 'block';
    } else {
      arrow.style.display = 'block';
      hand.style.display = 'none';
    }
  }

  function playTone() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(TONE_FREQUENCY, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + TONE_DURATION / 1000);
  }

  function checkButtons() {
    const buttons = Array.from(document.querySelectorAll('button'));

    const pos = getCursorPosition();

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();

      // Neu: Button-Position einmalig loggen im Debug-Modus
      if (DEBUG && !loggedButtons.has(button)) {
        loggedButtons.add(button);
        log(
          `Neuer Button entdeckt! Screen-Position: left=${rect.left.toFixed(
            0
          )}, top=${rect.top.toFixed(0)}, right=${rect.right.toFixed(
            0
          )}, bottom=${rect.bottom.toFixed(0)}, width=${rect.width.toFixed(
            0
          )}, height=${rect.height.toFixed(0)}`
        );
      }

      const inside =
        pos.x >= rect.left &&
        pos.x <= rect.right &&
        pos.y >= rect.top &&
        pos.y <= rect.bottom;

      if (inside) {
        log(`Button ausgelöst von Cursor ${instanceId}`);
        alertDebug(
          `Button ausgelöst!\nCursor: (${pos.x.toFixed(0)}, ${pos.y.toFixed(
            0
          )})\nButton: (${rect.left.toFixed(0)}, ${rect.top.toFixed(
            0
          )})\nText: ${button.innerText.trim()}`
        );
        if(lastClickedButton != button){
            button.click();
            
            switchCursorMode(true);
            setTimeout(() => switchCursorMode(false), 1000);
            playTone();
            lastClickedButton = button;
        }else{
            console.log("NICHT NOCHMAL "+button.id);
        }
        
        
        
      }
    });
  }

  function removeInstance() {
    if (timerId) clearInterval(timerId);
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.remove();
    log('Instanz wurde entfernt.');
  }

  // INIT
  const overlay = createCursorOverlay();
  switchCursorMode(false);
  timerId = setInterval(checkButtons, CHECK_INTERVAL);
})();

