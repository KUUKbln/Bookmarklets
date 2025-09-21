/**
 * bookmarklet-template.js
 *
 * Objektstruktur für Bookmarklets.
 * Beinhaltet Metadaten, die ausführbare Funktion `run()` 
 * sowie eine `href()`-Methode zur Erzeugung eines javascript:-Links.
 *
 * Optionen in `href()`:
 *  - encode: URI-Encoding aktivieren (Standard: true)
 *  - stripComments: JS-Kommentare entfernen (Standard: true)
 *  - collapseWhitespace: überflüssige Leerzeichen zusammenfassen (Standard: true)
 *  - removeNewlines: Zeilenumbrüche und Tabs entfernen (Standard: true)
 *  - debug: Wenn true, wird der generierte Code (unkodiert) in der Konsole ausgegeben
 *
 * Hinweis: KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 */

const BookmarkletTemplate = {
  meta: {
    id: 'bookmarklet_template',
    title: 'Beispiel-Bookmarklet',
    short: 'TEMPLATE',
    description: 'Template für neue Bookmarklets'
  },

  run() {
    alert("Hello from template!");
  }
};

// Füge href() Methode nur hinzu, wenn nicht bereits vorhanden
if (!BookmarkletTemplate.href) {
  BookmarkletTemplate.href = function ({
    encode = true,
    stripComments = true,
    collapseWhitespace = true,
    removeNewlines = true,
    debug = false
  } = {}) {
    let code = this.run.toString();

    if (stripComments) {
      code = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }

    if (removeNewlines) {
      code = code.replace(/[\n\r\t]+/g, '');
    }

    if (collapseWhitespace) {
      code = code.replace(/\s{2,}/g, ' ');
    }

    const wrapped = `(${code})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Code:\n", wrapped);
    }

    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  };
}

// export default BookmarkletTemplate;  // für ES Module

// ChatGPT (GPT-4o) – 2025-09-21
