/*
 bitte beachte die Regeln in README-AI.md.

bookmarklet-paperclip.js

das Bookmarklet erzeugt bei Aufruf ein Overlay mit einer Büroklammer als SVG Grafik. Diese Büroklammer kann einen Text speichern. Default: "Ich kann Dir einen Text speichern."

Der Text wird im local storage gespeichert, und beim Start geladen.


Die Position der Büroklammer lässt sich verschieben.das funktioniert per Cursor oder Touch. 

Die Büroklammer lässt sich in ein Textfeld oder Input ziehen: Der Text wird dann dort hinein kopiert. Die Klammer springt zurück an ihre Position 

Bei Klick auf die Klammer fragt ein confirm, ob der  Text in die Zwischenablage kopiert werden soll. Der Text wird in der console ausgegeben.

Um neuen Text zu speichern, muss Mann die Klammer 1 sekunde gedrückt halten. Wenn im Document ein Text markiert ist, wird dieser gespeichert. Wenn keiner markiert ist erscheint ein Prompt zum Bearbeiten des aktuellen Texts.


Die SVG-Büroklammer hat Augen, die dorthin gucken wo Klicks oder Touch stattfindet. Bei Interaktion oder verschieben, zeigt eine Sprechblase die Grösse des Speichertextes an.

Etwaige Fehler werden abgefangen und per alert erklärt. 

Wenn bei Aufruf bereits eine Büroklammer vorhanden ist, wird das als Ausschalten interpretiert, alles aus dem document entfernen. Der nächste Aufruf des Bookmarklet startet dann frisch.

*/


(() => {
  // Prüfen, ob Büroklammer-Overlay schon existiert -> dann entfernen (toggle Funktion)
  if (document.getElementById('bookmarklet-paperclip-overlay')) {
    document.getElementById('bookmarklet-paperclip-overlay').remove();
    return;
  }

  // Hilfsfunktion: lokal speichern und laden
  const STORAGE_KEY = 'bookmarklet-paperclip-text';
  const getStoredText = () => localStorage.getItem(STORAGE_KEY) || 'Ich kann Dir einen Text speichern.';
  const setStoredText = (text) => localStorage.setItem(STORAGE_KEY, text);

  // Variablen für Büroklammer-Position (initial)
  let posX = window.innerWidth - 100;
  let posY = window.innerHeight - 150;

  // SVG Büroklammer mit Augen als string (vereinfacht)
  const paperclipSVG = `
  <svg id="paperclip-svg" width="80" height="80" viewBox="0 0 64 64" style="cursor: grab;" xmlns="http://www.w3.org/2000/svg">
    <g>
      <!-- Klammer -->
      <path d="M20 12 L44 36 A10 10 0 1 1 28 52 L16 40" stroke="#555" stroke-width="4" fill="none" />
      <!-- Augen -->
      <circle id="eye-left" cx="24" cy="24" r="4" fill="#222"/>
      <circle id="eye-right" cx="40" cy="24" r="4" fill="#222"/>
      <!-- Pupillen -->
      <circle id="pupil-left" cx="24" cy="24" r="2" fill="#fff"/>
      <circle id="pupil-right" cx="40" cy="24" r="2" fill="#fff"/>
    </g>
  </svg>
  `;

  // Overlay mit fixed Position
  const overlay = document.createElement('div');
  overlay.id = 'bookmarklet-paperclip-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = posX + 'px';
  overlay.style.top = posY + 'px';
  overlay.style.zIndex = 2147483647; // max z-index
  overlay.style.userSelect = 'none';
  overlay.style.touchAction = 'none';

  // Sprechblase anzeigen
  const speechBubble = document.createElement('div');
  speechBubble.style.position = 'absolute';
  speechBubble.style.bottom = '90px';
  speechBubble.style.left = '50%';
  speechBubble.style.transform = 'translateX(-50%)';
  speechBubble.style.padding = '6px 10px';
  speechBubble.style.background = 'rgba(0,0,0,0.7)';
  speechBubble.style.color = 'white';
  speechBubble.style.fontSize = '12px';
  speechBubble.style.borderRadius = '10px';
  speechBubble.style.whiteSpace = 'nowrap';
  speechBubble.style.pointerEvents = 'none';
  speechBubble.style.opacity = '0';
  speechBubble.style.transition = 'opacity 0.3s ease';

  overlay.innerHTML = paperclipSVG;
  overlay.appendChild(speechBubble);
  document.body.appendChild(overlay);

  // Text aus localStorage laden
  let storedText = getStoredText();

  // Funktion: Sprechblase Text anzeigen für 1.5s
  const showSpeechBubble = (text) => {
    speechBubble.textContent = text;
    speechBubble.style.opacity = '1';
    clearTimeout(speechBubble._timeout);
    speechBubble._timeout = setTimeout(() => {
      speechBubble.style.opacity = '0';
    }, 1500);
  };

  // Augen bewegen: schauen auf Klick- oder Touchposition relativ zur Büroklammer
  const updateEyes = (clientX, clientY) => {
    const rect = overlay.getBoundingClientRect();
    const eyeLeft = overlay.querySelector('#pupil-left');
    const eyeRight = overlay.querySelector('#pupil-right');
    const centerX = rect.left + 24;
    const centerY = rect.top + 24;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 3;

    const offsetX = Math.cos(angle) * maxOffset;
    const offsetY = Math.sin(angle) * maxOffset;

    eyeLeft.setAttribute('cx', 24 + offsetX);
    eyeLeft.setAttribute('cy', 24 + offsetY);
    eyeRight.setAttribute('cx', 40 + offsetX);
    eyeRight.setAttribute('cy', 24 + offsetY);
  };

  // Reset Augen zur Mitte
  const resetEyes = () => {
    overlay.querySelector('#pupil-left').setAttribute('cx', 24);
    overlay.querySelector('#pupil-left').setAttribute('cy', 24);
    overlay.querySelector('#pupil-right').setAttribute('cx', 40);
    overlay.querySelector('#pupil-right').setAttribute('cy', 24);
  };

  // Drag & Drop Variablen
  let dragging = false;
  let dragStartX, dragStartY, origX, origY;
  let longPressTimer = null;

  // Hilfsfunktion: Text in Clipboard kopieren + console log
  const copyTextToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Bookmarklet Paperclip: Text in Zwischenablage kopiert:', text);
      }, () => {
        alert('Fehler: Kann Text nicht in Zwischenablage kopieren.');
      });
    } catch {
      alert('Fehler: Clipboard API nicht verfügbar.');
    }
  };

  // Funktion: Büroklammer zurück an Startposition setzen
  const resetPosition = () => {
    overlay.style.left = posX + 'px';
    overlay.style.top = posY + 'px';
  };

  // Start Dragging
  const startDrag = (e) => {
    e.preventDefault();
    dragging = true;
    dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
    dragStartY = (e.touches ? e.touches[0].clientY : e.clientY);
    const rect = overlay.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    overlay.style.cursor = 'grabbing';

    // Langzeitdruck starten (1 Sekunde)
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      // 1 Sekunde gedrückt -> Text speichern
      let selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        storedText = selectedText;
        setStoredText(storedText);
        showSpeechBubble('Text gespeichert!');
      } else {
        const newText = prompt('Kein Text markiert. Aktuellen Text bearbeiten:', storedText);
        if (newText !== null) {
          storedText = newText;
          setStoredText(storedText);
          showSpeechBubble('Text gespeichert!');
        }
      }
    }, 1000);
  };

  // Bewegen während Drag
  const onDrag = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    const newX = origX + dx;
    const newY = origY + dy;
    overlay.style.left = newX + 'px';
    overlay.style.top = newY + 'px';

    // Augen folgen Cursor
    updateEyes(clientX, clientY);

    // Sprechblase mit Textlänge anzeigen
    showSpeechBubble(`Textgröße: ${storedText.length} Zeichen`);
  };

  // Drag Ende
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    overlay.style.cursor = 'grab';
    resetEyes();

    // Position aktualisieren
    const rect = overlay.getBoundingClientRect();
    posX = rect.left;
    posY = rect.top;

    // Langzeitdruck abbrechen
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Prüfen, ob Büroklammer auf ein Textfeld/Input gezogen wurde
    // Dann Text in das Feld einfügen, Klammer zurückspringen
    const clientX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const clientY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
    const dropElem = document.elementFromPoint(clientX, clientY);

    if (dropElem) {
      if (
        (dropElem.tagName === 'INPUT' && ['text', 'search', 'url', 'tel', 'password'].includes(dropElem.type)) ||
        dropElem.tagName === 'TEXTAREA' ||
        dropElem.isContentEditable
      ) {
        try {
          if (dropElem.isContentEditable) {
            // Contenteditable Bereich: Einfügen an Cursorposition
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(storedText));
            } else {
              dropElem.textContent += storedText;
            }
          } else {
            // Input oder Textarea
            const startPos = dropElem.selectionStart;
            const endPos = dropElem.selectionEnd;
            const val = dropElem.value;
            dropElem.value = val.slice(0, startPos) + storedText + val.slice(endPos);
            dropElem.selectionStart = dropElem.selectionEnd = startPos + storedText.length;
          }
          dropElem.focus();
          showSpeechBubble('Text eingefügt!');
        } catch (error) {
          alert('Fehler beim Einfügen des Texts: ' + error.message);
        }
        resetPosition();
        return;
      }
    }
    // Falls nicht auf Eingabefeld, Klammer an Position belassen
  };

  // Klick auf Büroklammer -> Text in Zwischenablage + console.log
  const onClick = (e) => {
    e.preventDefault();
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    const confirmed = confirm('Text in Zwischenablage kopieren?');
    if (confirmed) {
      copyTextToClipboard(storedText);
      showSpeechBubble('Text kopiert!');
    }
  };

  // Events hinzufügen
  overlay.addEventListener('mousedown', startDrag);
  overlay.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);

  overlay.addEventListener('click', onClick);

})();