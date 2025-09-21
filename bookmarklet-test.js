/**
 * bookmarklet_helloWorld.js
 *
 * Einfaches Bookmarklet zur Demonstration des Templates.
 * Zeigt beim Ausführen eine Alertbox mit "Hallo Welt".
 *
 * KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 */

const bookmarklet_helloWorld = {
  meta: {
    id: 'bookmarklet_helloWorld',
    title: 'Hallo-Welt-Bookmarklet',
    short: 'HW',
    description: 'Zeigt eine einfache Begrüßung an.'
  },

  run() {
    alert("Hallo Welt");
    console.log("Bookmarklet wurde ausgeführt.");
    document.body.style.backgroundColor = "#ffe";
  }
};

if (!bookmarklet_helloWorld.href) {
  bookmarklet_helloWorld.href = function ({
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

// ChatGPT (GPT-4o) – 2025-09-21
