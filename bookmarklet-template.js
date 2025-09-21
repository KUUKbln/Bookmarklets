/**
 * Bookmarklet Template
 *
 *
 * Definiert ein Bookmarklet-Objekt mit Struktur:
 * - label: { title, short, description } – Metadaten für Anzeige, Tooltip, Linktext
 * - run(): Funktion, die den Bookmarklet-Code enthält
 * - href(): gibt eine bookmarklet-fähige URL zurück (als javascript:...), wird ergänzt falls nicht definiert
 *
 * href() wird nur ergänzt, falls noch nicht definiert,
 * und erzeugt die Bookmarklet-JavaScript-URL.
 *
 * Objektname-Konvention:
 * - Prefix "bookmarklet_"
 * - Danach: CamelCase für den Funktionsteil
 * - Beispiel: bookmarklet_exampleName
 * 
 * WICHTIG:
 * Der ausführliche Kommentar in jeder Bookmarklet-Datei enthält Autor und Datum,
 * beschreibt die Funktionsweise und diente als Vorgabe zur Programmierung.
 * Dieser Kommentar muss beim Erstellen oder Umschreiben vollständig erhalten bleiben. 
 * 
 * KI-generierter Code wird durch Name und Version kenntlich gemacht und unterzeichnet.
 */


const bookmarklet_template = {
  label: {
    title: "Bookmarklet Titel",
    short: "kurz",
    description: "Kurze Beschreibung des Bookmarklets"
  },

  run() {
    // Bookmarklet-Code hier einfügen
  }
};

// href nur ergänzen, falls nicht bereits definiert
bookmarklet_template.href = bookmarklet_template.href || function({ encode = true } = {}) {
  const code = `(${this.run.toString()})();`;
  return `javascript:${encode ? encodeURIComponent(code) : code}`;
};

