/*
bookmarklet-paperclip.js

Dieses Bookmarklet fügt eine verschiebbare Büroklammer als Overlay auf die Webseite ein. Die Büroklammer kann Text speichern und bei Klick in die Zwischenablage kopieren.

Funktionen:

- Text wird im localStorage gespeichert und beim Start geladen.
- Die Büroklammer lässt sich per Maus oder Touch verschieben.
- Bei Klick auf die Büroklammer:
  - wird der gespeicherte Text in die Zwischenablage kopiert.
  - wenn ein Eingabefeld fokussiert ist, wird der Text dort eingefügt (ohne Animation).
- Bei langem Drücken (1 Sekunde):
  - Wenn Text auf der Seite markiert ist → wird er gespeichert.
  - Sonst erscheint ein Prompt zur Bearbeitung.
- Der gespeicherte Text wird unterhalb der Büroklammer angezeigt, schräg und schwarz.
- Augen und Animationen sind **entfernt**.
- Ein erneuter Aufruf entfernt die Büroklammer wieder.

© Du, 2025.
*/

(function () {
  if (document.getElementById('bookmarklet-paperclip-overlay')) {
    document.getElementById('bookmarklet-paperclip-overlay').remove();
    return;
  }

  const STORAGE_KEY = 'bookmarklet-paperclip-text';
  const getStoredText = () => localStorage.getItem(STORAGE_KEY) || 'Ich kann Dir einen Text speichern.';
  const setStoredText = (text) => localStorage.setItem(STORAGE_KEY, text);

  const posX = window.innerWidth - 100;
  const posY = window.innerHeight - 150;

  // Büroklammer SVG (ohne Augen)
  const paperclipSVG = `
    <svg id="paperclip-svg" width="128" height="128" viewBox="0 0 128 128" style="cursor: grab; user-select: none;" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-30 32 32) translate(0,15)">
        <path d="M54.93 24.325a234571.595 234571.595 0 0 1-30.812 31.284a8.979 8.979 0 0 1-12.825 0c-3.536-3.59-3.536-9.434 0-13.023L46.025 7.321a5.414 5.414 0 0 1 7.732 0c2.068 2.1 2.13 5.478.186 7.654l-.024-.025l-30.356 30.839v-.002c-.718.73-1.882.73-2.6 0a1.885 1.885 0 0 1-.054-2.58L47.18 16.456c.703-.713.705-1.9 0-2.615c-.7-.711-1.824-.661-2.523.053c-.585.596-25.906 26.275-26.21 26.585a5.95 5.95 0 0 0-1.435 2.375c-.34 1.037-.321 2.293.035 3.322a5.75 5.75 0 0 0 2.367 3.027c2.092 1.344 4.96.963 6.705-.779l30.187-30.666l.029.029c3.553-3.606 3.553-9.476 0-13.082a9.025 9.025 0 0 0-12.886 0L8.715 39.971c-4.953 5.033-4.953 13.221 0 18.254a12.59 12.59 0 0 0 17.978 0c.501-.506 30.681-31.15 30.813-31.286a1.886 1.886 0 0 0 0-2.614a1.82 1.82 0 0 0-2.576 0" fill="#000000"/>
      </g>
    </svg>`;

  const overlay = document.createElement('div');
  overlay.id = 'bookmarklet-paperclip-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = posX + 'px';
  overlay.style.top = posY + 'px';
  overlay.style.zIndex = 2147483647;
  overlay.style.userSelect = 'none';
  overlay.style.touchAction = 'none';
  overlay.innerHTML = paperclipSVG;
  document.body.appendChild(overlay);

  let storedText = getStoredText();

  // Text unterhalb der Büroklammer anzeigen
  const lettersContainer = document.createElement('div');
  lettersContainer.style.position = 'absolute';
  lettersContainer.style.left = '0';
  lettersContainer.style.top = '28px'; // unter SVG
  lettersContainer.style.textAlign = 'left';
  lettersContainer.style.pointerEvents = 'none';
  lettersContainer.style.fontFamily = 'monospace';
  lettersContainer.style.whiteSpace = 'pre-wrap';
  lettersContainer.style.color = 'black';
   lettersContainer.style.minWidth = '600px';
  lettersContainer.style.maxWidth = '800px';
  lettersContainer.style.transform = 'rotate(3deg)';
  lettersContainer.textContent = storedText;
  overlay.appendChild(lettersContainer);

  // Speech-Bubble (z.B. "Text kopiert!" / "Text gespeichert!")
  const speechBubble = document.createElement('div');
  speechBubble.style.position = 'absolute';
  speechBubble.style.bottom = '90px';
  speechBubble.style.left = '50%';
  speechBubble.style.transform = 'translateX(-50%)';
  speechBubble.style.padding = '6px 10px';
  speechBubble.style.background = 'rgba(0,0,0,0.8)';
  speechBubble.style.color = 'white';
  speechBubble.style.borderRadius = '10px';
  speechBubble.style.fontSize = '12px';
  speechBubble.style.pointerEvents = 'none';
  speechBubble.style.opacity = '0';
  speechBubble.style.transition = 'opacity 0.3s ease';
  overlay.appendChild(speechBubble);

  function showSpeechBubble(text) {
    speechBubble.textContent = text;
    speechBubble.style.opacity = '1';
    clearTimeout(speechBubble._timeout);
    speechBubble._timeout = setTimeout(() => {
      speechBubble.style.opacity = '0';
    }, 1500);
  }

  // Dragging-Logik
  let dragging = false, dragStartX, dragStartY, origX, origY;
  let longPressTimer = null;
  let movedDuringDrag = false;

  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    movedDuringDrag = false;
    dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = overlay.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    overlay.style.cursor = 'grabbing';

    // Long-press zum Speichern
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      dragging = false;
      overlay.style.cursor = 'grab';

      if (movedDuringDrag) return;

      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        storedText = selectedText;
        setStoredText(storedText);
        lettersContainer.textContent = storedText;
        showSpeechBubble('Text gespeichert!');
      } else {
        const newText = prompt('Kein Text markiert. Aktuellen Text bearbeiten:', storedText);
        if (newText !== null) {
          storedText = newText;
          setStoredText(storedText);
          lettersContainer.textContent = storedText;
          showSpeechBubble('Text gespeichert!');
        }
      }
    }, 1000);
  }

  function onDrag(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    overlay.style.left = origX + dx + 'px';
    overlay.style.top = origY + dy + 'px';
    movedDuringDrag = true;
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    overlay.style.cursor = 'grab';
    if (longPressTimer) clearTimeout(longPressTimer);
  }

  function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showSpeechBubble('Text kopiert!');
    }).catch(() => {
      alert('Konnte Text nicht kopieren.');
    });
  }

  function insertTextDirectly(input, text) {
    if (input.isContentEditable) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    } else {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.slice(0, start) + text + input.value.slice(end);
      input.selectionStart = input.selectionEnd = start + text.length;
    }
  }

  function onClick() {
    copyTextToClipboard(storedText);
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (
        (activeEl.tagName === 'INPUT' && ['text','search','url','tel','password'].includes(activeEl.type)) ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      )
    ) {
      insertTextDirectly(activeEl, storedText);
    }
  }

  // Event-Listener setzen
  overlay.addEventListener('mousedown', startDrag);
  overlay.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);

  overlay.addEventListener('click', () => {
    if (!movedDuringDrag) onClick();
  });

})();
