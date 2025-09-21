/**
 * Bookmarklet Template
 *
 * Definiert ein Bookmarklet-Objekt mit:
 * - label: { title, text, description } für UI und Tooltips
 * - run(): Funktion mit Bookmarklet-Code
 *
 * href() wird nur ergänzt, falls noch nicht definiert,
 * und erzeugt die Bookmarklet-JavaScript-URL.
 */

const BookmarkletTemplate = {
  label: {
    title: "Bookmarklet Titel",
    text: "kurz",
    description: "Kurze Beschreibung"
  },

  run() {
    // Bookmarklet-Code hier
  }
};

BookmarkletTemplate.href = BookmarkletTemplate.href || function({ encode = true } = {}) {
  const code = `(${this.run.toString()})();`;
  return `javascript:${encode ? encodeURIComponent(code) : code}`;
};

export default BookmarkletTemplate;
