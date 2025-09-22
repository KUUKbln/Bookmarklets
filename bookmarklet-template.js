/**
 * bookmarklet-template.js
 *
 * Objektstruktur für Bookmarklets.
 * Beinhaltet Metadaten, die ausführbare Funktion `run()` 
 * sowie eine `href()`-Methode zur Erzeugung eines javascript:-Links.
 *
 * Vorlage für neue Bookmarklets im globalen Format.
 * Automatische Registrierung in `window.bookmarklets[meta.id]`.
 * 
 * Optionen in `href()`:
 *  - encode: URI-Encoding aktivieren (Standard: true)
 *  - stripComments: JS-Kommentare entfernen (Standard: true)
 *  - collapseWhitespace: überflüssige Leerzeichen zusammenfassen (Standard: true)
 *  - removeNewlines: Zeilenumbrüche und Tabs entfernen (Standard: true)
 *  - debug: Wenn true, wird der generierte Code (unkodiert) in der Konsole ausgegeben
 *
 * Hinweis: KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 * ChatGPT (GPT-4o) – 2025-09-21
 */
window.bookmarklets = window.bookmarklets || {};

const bookmarklet_template = {
  meta: {
    id: 'bookmarklet_template',
    title: 'Beispiel-Bookmarklet',
    short: 'TEMPLATE',
    description: 'Template für neue Bookmarklets'
  },

  run() {
    alert("Hello from template!");
    console.log("Bookmarklet ausgeführt.");
  }
};

if (!bookmarklet_template.href) {
  bookmarklet_template.href = function ({
    encode = true,
    stripComments = true,
    collapseWhitespace = true,
    removeNewlines = true,
    debug = false
  } = {}) {
    let code = this.run.toString();

    // Nur Funktions-Body extrahieren
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

    const wrapped = `(function(){${code}})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Code:\n", wrapped);
    }

    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  };
}

// Automatisch im globalen Namespace registrieren
window.bookmarklets[bookmarklet_template.meta.id] = bookmarklet_template;

