/**
 * bookmarklet_codesnippets_localstorage.js
 *
 * Beschreibung:
 * Dieses Bookmarklet verwaltet Code-Snippets im LocalStorage.
 * Es unterstützt Speichern, Laden und Löschen von Snippets.
 * 
 * Funktionsweise:
 * - Aktion wählen via prompt: speichern (s), laden (l), löschen (x)
 * - Beim Speichern wird markierter Text als Snippet mit Titel & Zeitstempel abgelegt
 * - Beim Laden kann man aus den letzten 16 Snippets wählen, die in ein aktives Textfeld eingefügt werden
 * - Löschen entfernt alle Snippets
 *
 * Voraussetzungen:
 * - LocalStorage muss verfügbar sein
 * - Ausführbar in modernen Browsern
 *
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-09-21
 *
 * KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 */

const bookmarklet_codesnippets_localstorage = {
  label: {
    title: "Code Snippets LocalStorage",
    short: "CodeSnipLS",
    description: "Speichert, lädt und löscht Code-Snippets im LocalStorage"
  },

  run() {
    /** @typedef {Object} Snippet
     * @property {string} title - descriptiver Titel
     * @property {string} body - Snippet Inhalt
     * @property {number} timestamp - Zeitstempel
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
      let candidate = text.split(';')[0].slice(0, 40);
      candidate = candidate.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (candidate.length === 0) {
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
            const sel = window.getSelection();
            if (!sel.rangeCount) throw new Error('Kein Cursor');
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.setStart(range.endContainer, range.endOffset);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            const start = active.selectionStart;
            const end = active.selectionEnd;
            const val = active.value;
            active.value = val.substring(0, start) + text + val.substring(end);
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
      if (snippets.length === 0) {
        alert("Keine Snippets vorhanden.");
        return;
      }
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
  },

  href({ encode = true } = {}) {
    const code = `(${this.run.toString()})();`;
    return `javascript:${encode ? encodeURIComponent(code) : code}`;
  }
};

export default bookmarklet_codesnippets_localstorage;

// Stand: 2025-09-21 — Erstellt/aktualisiert durch ChatGPT-4o (OpenAI)
