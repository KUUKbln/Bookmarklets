javascript:(function () {
/*
  Schreibe eine js-Bookmarklet-Funktion 
  
  Hole snippets aus localstorage. key: codesnippet
  Wenn keine Eintraege, dann leeres Array. alert: "hallo welt"
  
  prompt("Aktion? (s = speichern, l = laden, x = löschen)");
  
  Wenn aktion == speichern und beim Aufruf ein Text markiert ist:
    -- neues snippet object
    -- nehme diesen text als snippet.body.
    -- nehme aktuellen timestamp als snippet.timestamp.
    -- snippet.title max. 40 erste ascii-Buchstaben(keine zeichen) in GROSS, oder bis Semikolon wenn vorher, sonst: timestamp
    -- entferne die markierung vom text im document
    -- ende: speichere snippet: neuer eintrag in localstorage, key: codesnippet, item: snippet
  sonst wenn aktion == löschen:
    -- lösche localstorage objekt. key: codesnippet 
  sonst:
    -- zeige snippet-Auswahl als prompt/nummerierte Liste: letzte 16 einträge snippet.title anzeigen
    -- wenn gueltige auswahl:
    -- -- alert snippet-title und datum von timestamp
    -- -- versuche:kopiere snippet-body an die aktuelle cursor position im document
    -- -- -- bei fehler: alert "nicht in textfeld um einzufuegen"
    -- sonst:
    -- -- alert "nichts markiert. nichts kopiert"
  
  
  Hinweise:
    Pruefe diese Anleitung. Mach Verbesserungsvorschläge wenn nötig.
    Erhalte diesen Kommentar.
    Unterschreibe mit Datum.
    
*/

/**
 * @typedef {Object} Snippet
 * @property {string} title - descriptive title
 * @property {string} body - codesnippet body
 * @property {number} timestamp 
 */

function getSnippets() {
  try {
    const data = localStorage.getItem('codesnippet');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSnippets(snippets) {
  localStorage.setItem('codesnippet', JSON.stringify(snippets));
}

function formatTitle(text, timestamp) {
  // title aus ersten 40 ascii-Buchstaben oder bis Semikolon
  let candidate = text.split(';')[0].slice(0, 40);
  // nur ascii-Buchstaben behalten, rest entfernen
  candidate = candidate.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (candidate.length === 0) {
    // fallback: timestamp als string
    candidate = new Date(timestamp).toISOString();
  }
  return candidate;
}

function removeSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (!sel.isCollapsed) sel.removeAllRanges();
  }
}

function insertAtCursor(text) {
  const active = document.activeElement;
  try {
    if (active && (active.tagName === 'TEXTAREA' || 
                   (active.tagName === 'INPUT' && active.type === 'text') ||
                   active.isContentEditable)) {
      if (active.isContentEditable) {
        // contenteditable element
        const sel = window.getSelection();
        if (!sel.rangeCount) throw new Error('Kein Cursor');
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        // Cursor nach dem eingefügten Text setzen
        range.setStart(range.endContainer, range.endOffset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        // textarea oder input[type=text]
        const start = active.selectionStart;
        const end = active.selectionEnd;
        const val = active.value;
        active.value = val.substring(0, start) + text + val.substring(end);
        // Cursor nach eingefügtem Text
        active.selectionStart = active.selectionEnd = start + text.length;
      }
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

alert("hallo welt");

const snippets = getSnippets();

const action = prompt("Aktion? (s = speichern, l = laden, x = löschen)");

if (!action) return;

if (action.toLowerCase() === 's') {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) {
    alert("Keine Textmarkierung zum Speichern.");
    return;
  }
  const body = sel.toString();
  const timestamp = Date.now();
  const title = formatTitle(body, timestamp);

  const snippet = { title, body, timestamp };

  snippets.push(snippet);
  saveSnippets(snippets);

  removeSelection();
  alert(`Snippet gespeichert: ${title}`);

} else if (action.toLowerCase() === 'x') {
  localStorage.removeItem('codesnippet');
  alert("Alle Snippets gelöscht.");

} else {
  // Laden/Auswahl
  if (snippets.length === 0) {
    alert("Keine Snippets vorhanden.");
    return;
  }
  // letzte 16 anzeigen (neueste unten)
  const recent = snippets.slice(-16);
  let list = recent.map((s, i) => `${i + 1}: ${s.title}`).join('\n');
  const choice = prompt(`Wähle Snippet (1-${recent.length}):\n${list}`);
  const idx = parseInt(choice, 10);
  if (isNaN(idx) || idx < 1 || idx > recent.length) {
    alert("Ungültige Auswahl.");
    return;
  }
  const selected = recent[idx - 1];
  const dateStr = new Date(selected.timestamp).toLocaleString();
  alert(`Titel: ${selected.title}\nDatum: ${dateStr}`);

  const inserted = insertAtCursor(selected.body);
  if (!inserted) {
    alert("Nicht in Textfeld einfügbar.");
  }
}

})();
