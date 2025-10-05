/*
bookmarklet-paperclip.js

Das Bookmarklet erzeugt bei Aufruf ein Overlay mit einer Büroklammer als SVG Grafik. Diese Büroklammer kann einen Text speichern. Default: "Ich kann Dir einen Text speichern."

Der Text wird im localStorage gespeichert und beim Start geladen.

Die Position der Büroklammer lässt sich per Drag (Cursor oder Touch) verschieben.

Bei Klick auf die Büroklammer:
- wird der gespeicherte Text in die Zwischenablage kopiert,
- wenn ein Textfeld oder ContentEditable-Feld fokussiert ist, wird der Text nacheinander als einzelne schwarze Buchstaben animiert dort eingefügt.

Um neuen Text zu speichern, muss die Büroklammer 1 Sekunde gedrückt gehalten werden. Wenn im Dokument ein Text markiert ist, wird dieser gespeichert. Ansonsten erscheint ein Prompt zur Bearbeitung.

Die SVG-Büroklammer hat Augen, die der Maus oder dem Touch folgen.

Über der Büroklammer tanzen die einzelnen Buchstaben des gespeicherten Texts als schwarze Buchstaben ohne Hintergrund.

Wenn das Bookmarklet erneut aufgerufen wird, wird das Overlay entfernt (Ausschalten).

*/

(function() {
  if (document.getElementById('bookmarklet-paperclip-overlay')) {
    document.getElementById('bookmarklet-paperclip-overlay').remove();
    return;
  }

  var STORAGE_KEY = 'bookmarklet-paperclip-text';
  var getStoredText = function() {
    return localStorage.getItem(STORAGE_KEY) || 'Ich kann Dir einen Text speichern.';
  };
  var setStoredText = function(text) {
    localStorage.setItem(STORAGE_KEY, text);
  };

  var posX = window.innerWidth - 100;
  var posY = window.innerHeight - 150;

  // SVG Büroklammer mit Augen und Drehung -30° um (32,32)
  var paperclipSVG = ''
    + '<svg id="paperclip-svg" width="128" height="128" viewBox="0 0 128 128" '
    + 'style="cursor: grab; user-select:none;" xmlns="http://www.w3.org/2000/svg">'
    + '<g transform="rotate(-30 32 32) translate(0,15)">'
    + '<path d="M54.93 24.325a234571.595 234571.595 0 0 1-30.812 31.284a8.979 8.979 0 0 1-12.825 0c-3.536-3.59-3.536-9.434 0-13.023L46.025 7.321a5.414 5.414 0 0 1 7.732 0c2.068 2.1 2.13 5.478.186 7.654l-.024-.025l-30.356 30.839v-.002c-.718.73-1.882.73-2.6 0a1.885 1.885 0 0 1-.054-2.58L47.18 16.456c.703-.713.705-1.9 0-2.615c-.7-.711-1.824-.661-2.523.053c-.585.596-25.906 26.275-26.21 26.585a5.95 5.95 0 0 0-1.435 2.375c-.34 1.037-.321 2.293.035 3.322a5.75 5.75 0 0 0 2.367 3.027c2.092 1.344 4.96.963 6.705-.779l30.187-30.666l.029.029c3.553-3.606 3.553-9.476 0-13.082a9.025 9.025 0 0 0-12.886 0L8.715 39.971c-4.953 5.033-4.953 13.221 0 18.254a12.59 12.59 0 0 0 17.978 0c.501-.506 30.681-31.15 30.813-31.286a1.886 1.886 0 0 0 0-2.614a1.82 1.82 0 0 0-2.576 0" fill="#000000"/>'
    + '</g>'
    // Augen: zwei Kreise + Pupillen
    + '<g transform="rotate(10 32 32) translate(10,-20)">'
    + '<circle id="eye-left" cx="23" cy="27" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>'
    + '<circle id="eye-right" cx="41" cy="27" r="5" fill="#fff" stroke="#333" stroke-width="1.5"/>'
    + '<circle id="pupil-left" cx="23" cy="27" r="2.2" fill="#333"/>'
    + '<circle id="pupil-right" cx="41" cy="27" r="2.2" fill="#333"/>'
    + '</g>'
    + '</svg>';

  var overlay = document.createElement('div');
  overlay.id = 'bookmarklet-paperclip-overlay';
  overlay.style.position = 'fixed';
  overlay.style.left = posX + 'px';
  overlay.style.top = posY + 'px';
  overlay.style.zIndex = 2147483647;
  overlay.style.userSelect = 'none';
  overlay.style.touchAction = 'none';

  overlay.innerHTML = paperclipSVG;
  document.body.appendChild(overlay);

  var storedText = getStoredText();

  // Container für die tanzenden Buchstaben über der Büroklammer
  var lettersContainer = document.createElement('div');
  lettersContainer.style.position = 'absolute';
  lettersContainer.style.left = '50%';
  lettersContainer.style.top = '-40px';
  lettersContainer.style.transform = 'translateX(-50%)';
  lettersContainer.style.pointerEvents = 'none';
  lettersContainer.style.whiteSpace = 'nowrap';
  overlay.appendChild(lettersContainer);

  // Erstelle einzelne Buchstaben als span, schwarz, animiert
  function updateLettersAnimation(text) {
    lettersContainer.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      let span = document.createElement('span');
      span.textContent = text[i];
      span.style.color = 'black';
      span.style.fontWeight = 'bold';
      span.style.display = 'inline-block';
      span.style.fontSize = '16px';
      span.style.margin = '0 1px';
      span.style.userSelect = 'none';

      // Animation: leichtes Auf- und Ab-Tanzen, jede Buchstabe phasenversetzt
      span.style.animation = `dance 1.5s ease-in-out infinite`;
      span.style.animationDelay = (i * 0.15) + 's';

      lettersContainer.appendChild(span);
    }
  }

  // Tanz-Keyframes im Style-Tag einfügen (einmal)
  var style = document.createElement('style');
  style.textContent = `
    @keyframes dance {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(style);

  updateLettersAnimation(storedText);

  // Dragging Variables
  var dragging = false;
  var dragStartX, dragStartY, origX, origY;
  var longPressTimer = null;
  var movedDuringDrag = false;

  function copyTextToClipboard(text) {
    try {
      navigator.clipboard.writeText(text).then(function() {
        console.log('Bookmarklet Paperclip: Text in Zwischenablage kopiert:', text);
      }, function() {
        alert('Fehler: Kann Text nicht in Zwischenablage kopieren.');
      });
    } catch(e) {
      alert('Fehler: Clipboard API nicht verfügbar.');
    }
  }

  function resetPosition() {
    overlay.style.left = posX + 'px';
    overlay.style.top = posY + 'px';
  }

  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    movedDuringDrag = false;
    dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
    var rect = overlay.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    overlay.style.cursor = 'grabbing';

    if (longPressTimer) clearTimeout(longPressTimer);
    longPressTimer = setTimeout(function() {
      // 1 Sekunde gedrückt -> Text speichern
      var selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        storedText = selectedText;
        setStoredText(storedText);
        updateLettersAnimation(storedText);
        showSpeechBubble('Text gespeichert!');
      } else {
        var newText = prompt('Kein Text markiert. Aktuellen Text bearbeiten:', storedText);
        if (newText !== null) {
          storedText = newText;
          setStoredText(storedText);
          updateLettersAnimation(storedText);
          showSpeechBubble('Text gespeichert!');
        }
      }
    }, 1000);
  }

  function onDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    var dx = clientX - dragStartX;
    var dy = clientY - dragStartY;
    var newX = origX + dx;
    var newY = origY + dy;

    if (!movedDuringDrag) {
      movedDuringDrag = true;
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    overlay.style.left = newX + 'px';
    overlay.style.top = newY + 'px';

    // Show bubble with text length
    showSpeechBubble('Textgröße: ' + storedText.length + ' Zeichen');
  }

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    overlay.style.cursor = 'grab';
    var rect = overlay.getBoundingClientRect();
    posX = rect.left;
    posY = rect.top;

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  // Klick: Nur wenn kein Drag
  var clickedDuringDrag = false;
  overlay.addEventListener('mousedown', function(e) {
    clickedDuringDrag = false;
    startDrag(e);
  });
  overlay.addEventListener('touchstart', function(e) {
    clickedDuringDrag = false;
    startDrag(e);
  }, { passive: false });

  window.addEventListener('mousemove', function(e) {
    if (dragging) {
      clickedDuringDrag = true;
    }
    onDrag(e);
  });
  window.addEventListener('touchmove', function(e) {
    if (dragging) {
      clickedDuringDrag = true;
    }
    onDrag(e);
  }, { passive: false });

  window.addEventListener('mouseup', function(e) {
    endDrag(e);
    if (!clickedDuringDrag) {
      onClick(e);
    }
  });
  window.addEventListener('touchend', function(e) {
    endDrag(e);
    if (!clickedDuringDrag) {
      onClick(e);
    }
  });

  function onClick(e) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    copyTextToClipboard(storedText);
    showSpeechBubble('Text kopiert!');

    // Prüfe fokussiertes Element, ob Text eingefügt werden kann
    var activeEl = document.activeElement;
    if (
      activeEl &&
      (
        (activeEl.tagName === 'INPUT' && ['text','search','url','tel','password'].indexOf(activeEl.type) !== -1) ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      )
    ) {
      animateTextInsertion(activeEl, storedText);
    }
  }

  // Gedankenblase mit Tooltip-Text (für kurze Anzeige)
  var speechBubble = document.createElement('div');
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
  overlay.appendChild(speechBubble);

  function showSpeechBubble(text) {
    speechBubble.textContent = text;
    speechBubble.style.opacity = '1';
    clearTimeout(speechBubble._timeout);
    speechBubble._timeout = setTimeout(function() {
      speechBubble.style.opacity = '0';
    }, 1500);
  }

  // Augen-Animation: Pupillen folgen Maus/Touch
  var svg = document.getElementById('paperclip-svg');
  var eyeLeft = svg.querySelector('#eye-left');
  var eyeRight = svg.querySelector('#eye-right');
  var pupilLeft = svg.querySelector('#pupil-left');
  var pupilRight = svg.querySelector('#pupil-right');

  function movePupils(clientX, clientY) {
    var rect = svg.getBoundingClientRect();
    var centerLeft = { x: rect.left + 23, y: rect.top + 27 };
    var centerRight = { x: rect.left + 41, y: rect.top + 27 };
    var maxDist = 2.5;

    function calcOffset(cx, cy) {
      var dx = clientX - cx;
      var dy = clientY - cy;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > maxDist) {
        dx = dx / dist * maxDist;
        dy = dy / dist * maxDist;
      }
      return { x: dx, y: dy };
    }

    var offsetLeft = calcOffset(centerLeft.x, centerLeft.y);
    var offsetRight = calcOffset(centerRight.x, centerRight.y);

    pupilLeft.setAttribute('cx', 23 + offsetLeft.x);
    pupilLeft.setAttribute('cy', 27 + offsetLeft.y);
    pupilRight.setAttribute('cx', 41 + offsetRight.x);
    pupilRight.setAttribute('cy', 27 + offsetRight.y);
  }

  window.addEventListener('mousemove', function(e) {
    movePupils(e.clientX, e.clientY);
  });
  window.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      movePupils(e.touches[0].clientX, e.touches[0].clientY);
    }
  });

  // Animation: Buchstaben nacheinander zum Cursor im Inputfeld "schwingen"
  function animateTextInsertion(input, text) {
    if (!text) return;
    var index = 0;
    var delay = 100; // ms pro Buchstabe

    function insertChar() {
      if (index >= text.length) return;

      var ch = text[index];

      if (input.isContentEditable) {
        // ContentEditable einfügen an Cursor
        var sel = window.getSelection();
        if (!sel.rangeCount) return;
        var range = sel.getRangeAt(0);
        var span = document.createElement('span');
        span.textContent = ch;
        span.style.color = 'black';
        span.style.position = 'relative';
        span.style.display = 'inline-block';

        // Tanzanimation: schwingen
        span.style.animation = 'swing 0.6s ease forwards';

        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        // Input oder Textarea: an Cursor-Position einfügen
        var start = input.selectionStart;
        var end = input.selectionEnd;
        var val = input.value;
        input.value = val.slice(0, start) + ch + val.slice(end);
        input.selectionStart = input.selectionEnd = start + 1;
      }

      index++;
      setTimeout(insertChar, delay);
    }

    insertChar();
  }

  // Swing Keyframes für schwingen Animation
  var swingStyle = document.createElement('style');
  swingStyle.textContent = `
    @keyframes swing {
      0% { transform: rotate(0deg) translateY(0); }
      50% { transform: rotate(15deg) translateY(-8px); }
      100% { transform: rotate(0deg) translateY(0); }
    }
  `;
  document.head.appendChild(swingStyle);

})();
