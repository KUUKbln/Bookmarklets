/**
 * @name YouTube Transcript Copy
 * @version 1.0
 * @description Kopiert das sichtbare YouTube-Transkript mit Zeitstempeln (in eckigen Klammern) in die Zwischenablage.
 * @author DeinName
 * @license MIT
 */
const YouTubeTranscriptBookmarklet = {
  meta: {
    name: "YouTube Transcript Extractor",
    short: "YTTranscript",
    description: "Extrahiert das Transkript mit Zeitmarken in eckigen Klammern von YouTube und kopiert es in die Zwischenablage.",
    version: "1.0.0",r
    author: "DeinName",
    site: "https://www.youtube.com"
  },

  run() {
    (async function() {
      const container = document.querySelector('ytd-transcript-renderer');
      if (!container) {
        alert("❌ Kein Transkript gefunden.");
        return;
      }
      
      async function scrollTranscript() {
        let lastHeight = 0;
        while (container.scrollHeight > lastHeight) {
          lastHeight = container.scrollHeight;
          container.scrollTo(0, lastHeight);
          await new Promise(r => setTimeout(r, 400));
        }
      }
      
      await scrollTranscript();
      
      const segments = [...container.querySelectorAll('ytd-transcript-segment-renderer')];
      if (segments.length === 0) {
        alert("❌ Keine Transkript-Segmente gefunden.");
        return;
      }
      
      const text = segments.map(seg => {
        const time = seg.querySelector('.segment-timestamp')?.innerText.trim() || '';
        const segText = seg.querySelector('.segment-text')?.innerText.replace(/\s+/g, ' ').trim() || '';
        return time ? `[${time}] ${segText}` : segText;
      }).join('\n');
      
      if (!text) {
        alert("❌ Transkript ist leer.");
        return;
      }
      
      try {
        await navigator.clipboard.writeText(text);
        alert("✅ Transkript (mit Zeitstempeln in eckigen Klammern) wurde in die Zwischenablage kopiert.");
      } catch (err) {
        prompt("✅ Kopiere das Transkript manuell (Strg+C):", text);
      }
    })();
  },

  href() {
    // Minifiziere und URI-encode die run-Funktion als IIFE für Bookmarklet-Href
    const fnCode = this.run.toString();
    // Extrahiere nur die Funktionserklärung ohne den Methoden-Namen
    const wrappedFn = `(${fnCode})()`;
    return `javascript:${encodeURIComponent(wrappedFn)}`;
  },

  toString() {
    return this.href();
  }
};
window.bookmarklets["YT_Transcript"] = YouTubeTranscriptBookmarklet;
