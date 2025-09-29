/**
 * @name YouTube Transcript Extractor
 * @version 1.0.0
 * @description Extrahiert sichtbare YouTube-Transkripte mit Zeitmarken in eckigen Klammern und kopiert sie in die Zwischenablage.
 * @author 
 * @license MIT
 * @source https://github.com/KUUKbln/Bookmarklets
 * @date 2025-09-29
 * @generated-by ChatGPT (GPT-4o)
 */

window.bookmarklets = window.bookmarklets || {};

const YT_Transcript = {
  meta: {
    id: 'YT_Transcript',
    name: 'YouTube Transcript Extractor',
    short: 'YTTranscript',
    description: 'Extrahiert das Transkript mit Zeitmarken in eckigen Klammern von YouTube und kopiert es in die Zwischenablage.',
    version: '1.0.0',
    author: '',
    site: 'https://www.youtube.com'
  },

  run() {
    (async function () {
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
/*
      try {
        await navigator.clipboard.writeText(text);
        alert("✅ Transkript (mit Zeitstempeln in eckigen Klammern) wurde in die Zwischenablage kopiert.");
      } catch (err) {
        prompt("✅ Kopiere das Transkript manuell (Strg+C):", text);
      }
*/
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.warn("⚠️ Konnte Zwischenablage nicht schreiben:", err);
        alert("⚠️ Konnte Zwischenablage nicht schreiben. ");
      }
      
      // Hilfsfunktion zur Bereinigung von Dateinamen
      function sanitizeFilename(name) {
        return name.replace(/[\\/:*?"<>|]/g, '_');
      }
      if (!document.body) {
        alert("⚠️ Kein Zugriff auf document.body – Download nicht möglich. (Ggf. aus Console kopieren.)");
        console.log(text);
        return;
      }

      // Erstelle Dateinamen
      const videoId = new URLSearchParams(location.search).get("v") || "unknown";
      const rawTitle = document.title.replace(/ - YouTube$/, "") || "video";
      const title = sanitizeFilename(rawTitle);
      const date = new Date().toISOString().slice(0, 10);
      const filename = `YT_${date}_${videoId}_${title}.txt`;
      
      // confirm statt alert
      const confirmed = confirm("✅ Transkript wurde in die Zwischenablage kopiert.\nMöchtest du es auch als .txt herunterladen?");
      if (confirmed) {
        try {
            if (!document.body) throw new Error("Kein <body>-Element gefunden.");
          
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
          
            // Element muss im DOM sein, damit .click() funktioniert
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (err) {
            console.warn("⚠️ Download fehlgeschlagen:", err);
            console.log("\n\n"+txt);
            prompt("⚠️ Download konnte nicht automatisch gestartet werden.\nDu kannst den Text manuell kopieren:", text);
          }
      }

    })();
  },

  href(options = {}) {
    const {
      encode = true,
      stripComments = true,
      collapseWhitespace = true,
      removeNewlines = true,
      debug = false
    } = options;

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

    const wrapped = `(function(){${code}})();`;

    if (debug) {
      console.debug("[Bookmarklet Debug] Code:\n", wrapped);
    }

    return `javascript:${encode ? encodeURIComponent(wrapped) : wrapped}`;
  },

  toString() {
    return this.href();
  }
};

window.bookmarklets[YT_Transcript.meta.id] = YT_Transcript;
