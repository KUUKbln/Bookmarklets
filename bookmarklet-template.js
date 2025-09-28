/**
 * bookmarklet-template.js
 * 
 * ✨ Universelle Vorlage für Bookmarklets (im Objektformat)
 * 📚 Gehört zu: https://github.com/KUUKbln/Bookmarklets
 *
 * Struktur:
 * - `meta`: Objekt mit Metadaten (id, title, description, etc.)
 * - `run()`: Hauptfunktion, die ausgeführt wird
 * - `href()`: Liefert Bookmarklet-Link als `javascript:…`-URL
 * 
 * Unterstützt automatische Registrierung via:
 *     window.bookmarklets[meta.id]
 * 
 * ➕ Empfohlene Vorgehensweise:
 * 1. Dieses Template kopieren und `id`, `title`, `description` anpassen
 * 2. Die `run()`-Methode mit Funktionalität füllen
 * 3. `bookmarklet.href()` aufrufen für den Bookmarklet-Link
 * 
 * ➕ Regeln aus `README-AI.md` beachten:
 * - Kommentar-Kopf mit Zweck, Herkunft (KI/Human), Datum
 * - KI-generierter Code mit GPT-Version und Datum kenntlich machen
 * - Einheitliche Objektstruktur, keine losen Funktions-Bookmarklets
 * - `bookmarklet.href()`-Methode erforderlich
 * 
 * @template
 * @version 1.1
 * @author GPT-4o
 * @generated 2025-09-29
 */

window.bookmarklets = window.bookmarklets || {};

const bookmarklet_template = {
  meta: {
    id: 'bookmarklet_template',              // ⚠️ Eindeutiger Bezeichner (auch für window.bookmarklets)
    title: 'Beispiel-Bookmarklet',           // 🔤 Menschlich lesbarer Titel
    short: 'TEMPLATE',                       // 🔠 Kurztitel für UI/Übersichten
    description: 'Template für neue Bookmarklets', // 📝 Zweck / Funktion
    author: 'GPT-4o',                        // ✍️ Optional: Ersteller
    created: '2025-09-29',                   // 📅 Erstellungsdatum
    updated: '2025-09-29'                    // ♻️ Letztes Update
  },

  /**
   * 🧠 Hauptfunktion des Bookmarklets
   * Alles was im Bookmarklet passieren soll, kommt hier rein.
   */
  run() {
    alert("✅ Hello from template!");
    console.log("📚 Bookmarklet ausgeführt.");
  }
};

// ➕ href-Methode hinzufügen, falls nicht vorhanden
if (!bookmarklet_template.href) {
  bookmarklet_template.href = function ({
    encode = true,
    stripComments = true,
    collapseWhitespace = true,
    removeNewlines = true,
    debug = false
  } = {}) {
    let code = this.run.toString();

    // 🧩 Nur den Funktionsrumpf extrahieren (zwischen {…})
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

    // 🔍 Kommentare entfernen (optional)
    if (stripComments) {
      code = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }

    // 🔧 Zeilenumbrüche/Tabs entfernen (optional)
    if (removeNewlines) {
      code = code.replace(/[\n\r\t]+/g, '');
    }

    // 🔧 Mehrfache Leerzeichen zusammenfassen
    if (collapseWhitespace) {
      code = code.replace(/\s{2,}/g, ' ');
    }

    const wrapped = `(function(){${code}})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Generierter Code:\n", wrapped);
    }

    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  };
}

// ✅ Automatisch registrieren im globalen Namespace
window.bookmarklets[bookmarklet_template.meta.id] = bookmarklet_template;
