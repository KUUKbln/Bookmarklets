/**
 * @name YouTube Transcript Copy
 * @version 1.0
 * @description Kopiert das sichtbare YouTube-Transkript mit Zeitstempeln (in eckigen Klammern) in die Zwischenablage.
 * @author DeinName
 * @license MIT
 */
const YouTubeTranscriptCopy = {
  meta: {
    name: "YouTube Transcript Copy",
    version: "1.0",
    description: "Kopiert das sichtbare YouTube-Transkript mit Zeitstempeln (in eckigen Klammern) in die Zwischenablage.",
    author: "DeinName",
    license: "MIT",
    url: location.href,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  },

  run() {
    try {
      this.init();
      this.scrollTranscript().then(() => {
        const text = this.collectTranscript();
        if (!text) throw new Error("Transkript ist leer.");
        this.copyToClipboard(text);
        alert("✅ Transkript (mit Zeitstempeln) wurde in die Zwischenablage kopiert.");
      }).catch(err => {
        this.handleError(err);
      });
    } catch (err) {
      this.handleError(err);
    }
  },

  init() {
    this.container = document.querySelector('ytd-transcript-renderer');
    if (!this.container) throw new Error("Kein Transkript gefunden.");
  },

  async scrollTranscript() {
    let lastHeight = 0;
    while (this.container.scrollHeight > lastHeight) {
      lastHeight = this.container.scrollHeight;
      this.container.scrollTo(0, lastHeight);
      await new Promise(r => setTimeout(r, 400));
    }
  },

  collectTranscript() {
    const segments = [...this.container.querySelectorAll('ytd-transcript-segment-renderer')];
    if (segments.length === 0) throw new Error("Keine Transkript-Segmente gefunden.");
    const lines = segments.map(seg => {
      const time = seg.querySelector('.segment-timestamp')?.innerText.trim() || '';
      const segText = seg.querySelector('.segment-text')?.innerText.replace(/\s+/g, ' ').trim() || '';
      return time ? `[${time}] ${segText}` : segText;
    });
    // Füge Footer mit Kommentar (Ladedatum etc.) hinzu
    lines.push(`\n// Transkript geladen am: ${new Date().toLocaleString()}`);
    return lines.join('\n');
  },

  copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Fallback: Prompt falls Clipboard API nicht geht
      prompt("Kopiere das Transkript manuell (Strg+C):", text);
    }
  },

  handleError(error) {
    alert(`❌ Fehler: ${error.message}`);
  },
};

// Starte das Bookmarklet
YouTubeTranscriptCopy.run();
