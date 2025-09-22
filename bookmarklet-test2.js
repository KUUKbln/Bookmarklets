/**
 * bookmarklet_helloWorld.js
 *
 * Einfaches Bookmarklet zur Demonstration des Templates.
 * Zeigt beim Ausführen eine Alertbox mit "Hallo Welt".
 *
 * KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 */

window.bookmarklets = window.bookmarklets || {};

const bookmarklet_test2= {
  meta: {
    id: 'bookmarklet_helloWorld',
    title: 'Hallo-Welt-Bookmarklet',
    short: 'HW',
    description: 'Zeigt eine einfache Begrüßung an.'
  },

  run() {
    alert("Hallo Welt2");
    console.log("Bookmarklet wurde ausgeführt.");
    document.body.style.backgroundColor = "#f0f";
  }
};

if (!bookmarklet_test2.href) {
  bookmarklet_test2.href = function ({
    encode = true,
    stripComments = true,
    collapseWhitespace = true,
    removeNewlines = true,
    debug = false
  } = {}) {
    // Funktion in String umwandeln
    let code = this.run.toString();

    // Nur den Funktionsbody extrahieren
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

    // In eine IIFE verpacken
    const wrapped = `(function(){${code}})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Code:\n", wrapped);
    }

    // JavaScript-URL zurückgeben
    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  };
}

window.bookmarklets["test2"] = bookmarklet_test2;
//export default window.bookmarklet_test; // Optional für ES Modules

