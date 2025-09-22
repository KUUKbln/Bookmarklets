/*
  bookmarklet-snippets.js
  Schreibe ein Bookmarklet, nimm als Template: bookmarklet-template.js

  Das Bookmarklet soll Code- oder Textschnipsel im Local-Storage speichern oder 
  daraus in das aktuelle Textelement einfügen.

  Ein Snippet sieht so aus:
  snippet = {title, body, timestamp}

  snippets_max = 12;
  localStorage_key = "bookmarklet-snippets"

  Beim Start prüft das Bookmarklet:
  - ob Text im Dokument markiert ist → das ist der Input-Text
  - ob der Fokus in einem Textfeld oder einem anderen editierbaren Element ist → das ist das Ausgabe-Element

  Das Bookmarklet lädt die verfügbaren Snippets aus dem Local-Storage oder erzeugt ein neues leeres Objekt.

  Es erzeugt ein Menü über `prompt`. Das Menü besteht aus:
  - den nummerierten Snippets in einzelnen Zeilen (nur Titel + gekürzter Body)
  - einer Befehlszeile:
    Speichern N, Löschen X, Leeren clear

  Der Benutzer wählt per Eingabe:
  - eine Nummer → Snippet wird eingefügt (in aktives Element, sonst angezeigt)
  - N → markierten Text als neuen Snippet speichern (nur wenn Text markiert ist)
  - X → löscht Snippet (es folgt Abfrage nach Nummer)
  - clear → löscht alle Snippets (mit confirm-Abfrage)

  Hinweise:
    - Nur max. 12 Snippets werden gespeichert
    - Ausgabe-Elemente sind <input>, <textarea> oder contentEditable-Elemente
    - Snippets ohne Ausgabeziel werden per prompt angezeigt (statt Einfügen)

  KI-generiert: ChatGPT (GPT-4o) – 2025-09-21
*/

window.bookmarklets = window.bookmarklets || {};

const bookmarklet_snippets = {
  meta: {
    id: 'bookmarklet_snippets',
    title: 'Snippet-Manager',
    short: 'SNIPPETS',
    description: 'Speichern und Einfügen von Textschnipseln über Local-Storage'
  },

  run() {
    const LS_KEY = "bookmarklet-snippets";
    const SNIPPETS_MAX = 12;

    const selection = window.getSelection().toString().trim();
    const activeElement = document.activeElement;
    const isEditable =
      activeElement &&
      (activeElement.tagName === 'TEXTAREA' ||
       activeElement.tagName === 'INPUT' && activeElement.type === 'text' ||
       activeElement.isContentEditable);

    function loadSnippets() {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function saveSnippets(snippets) {
      localStorage.setItem(LS_KEY, JSON.stringify(snippets));
    }

    function formatDate(ts) {
      const d = new Date(ts);
      return d.toLocaleString();
    }

    function renderMenu(snippets) {
      const lines = snippets.map((s, i) => {
        const short = s.body.length > 40 ? s.body.slice(0, 40) + "…" : s.body;
        return `${i + 1}. ${s.title} — ${short}`;
      });
      lines.push("");
      lines.push("Speichern N, Löschen X, Leeren clear");
      return lines.join("\n");
    }

    function insertText(text) {
      if (isEditable) {
        if (activeElement.setRangeText) {
          activeElement.setRangeText(text);
        } else if (activeElement.value !== undefined) {
          activeElement.value += text;
        } else if (activeElement.isContentEditable) {
          document.execCommand("insertText", false, text);
        }
      } else {
        prompt("Snippet-Inhalt:", text);
      }
    }

    function main() {
      let snippets = loadSnippets();

      const input = prompt(renderMenu(snippets));
      if (!input) return;

      const trimmedInput = input.trim();

      if (/^\d+$/.test(trimmedInput)) {
        const index = parseInt(trimmedInput) - 1;
        if (snippets[index]) {
          insertText(snippets[index].body);
        } else {
          alert("Ungültiger Index.");
        }
        return;
      }

      if (trimmedInput.toUpperCase() === "N") {
        if (!selection) {
          alert("Kein Text markiert. Bitte zuerst Text markieren.");
          return;
        }
        if (snippets.length >= SNIPPETS_MAX) {
          alert("Maximale Anzahl an Snippets erreicht.");
          return;
        }
        const title = prompt("Titel für das Snippet:", selection.slice(0, 30));
        if (!title) return;
        snippets.push({
          title,
          body: selection,
          timestamp: Date.now()
        });
        saveSnippets(snippets);
        alert(`Snippet "${title}" gespeichert.`);
        return;
      }

      if (trimmedInput.toUpperCase() === "X") {
        const delIndex = prompt("Index des Snippets zum Löschen:");
        const idx = parseInt(delIndex) - 1;
        if (snippets[idx]) {
          const removed = snippets.splice(idx, 1);
          saveSnippets(snippets);
          alert(`Snippet "${removed[0].title}" gelöscht.`);
        } else {
          alert("Ungültiger Index.");
        }
        return;
      }

      if (trimmedInput.toLowerCase() === "clear") {
        const sure = confirm("Alle Snippets unwiderruflich löschen?");
        if (sure) {
          localStorage.removeItem(LS_KEY);
          alert("Alle Snippets gelöscht.");
        }
        return;
      }

      alert("Ungültige Eingabe.");
    }

    try {
      main();
    } catch (e) {
      alert("Fehler im Bookmarklet: " + e.message);
      console.error(e);
    }
  }
};

if (!bookmarklet_snippets.href) {
  bookmarklet_snippets.href = function ({
    encode = true,
    stripComments = true,
    collapseWhitespace = true,
    removeNewlines = true,
    debug = false
  } = {}) {
    let code = this.run.toString();
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

    if (stripComments) {
      code = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }
    if (removeNewlines) {
      code = code.replace(/[\n\r\t]+/g, '');
    }
    if (collapseWhitespace) {
      code = code.replace(/\s{2,}/g, ' ');
    }

    const metaInfo = `/* ${this.meta.id} – generated ${new Date().toISOString().slice(0,10)} */`;
    const wrapped = `(function(){${metaInfo}${code}})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Code:\n", wrapped);
    }

    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  };
}

window.bookmarklets[bookmarklet_snippets.meta.id] = bookmarklet_snippets;

