/**
 * YouTube Transcript Copy Bookmarklet
 *
 * Extrahiert sichtbare Transkript-Segmente mit Zeitmarken (in eckigen Klammern)
 * und kopiert den Text in die Zwischenablage.
 *
 * Erstellt mit ChatGPT (GPT-4o) – 2025-09-29
 */
window.bookmarklets = window.bookmarklets || {};

const YT_Transcript = {
  meta: {
    id: 'YT_Transcript',
    title: 'YouTube Transcript Extractor',
    short: 'YTTranscript',
    description: 'Extrahiert sichtbare Transkripte mit Zeitmarken und kopiert sie in die Zwischenablage.',
    version: '1.0.0',
    author: 'DeinName',
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

      try {
        await navigator.clipboard.writeText(text);
        alert("✅ Transkript (mit Zeitstempeln in eckigen Klammern) wurde in die Zwischenablage kopiert.");
      } catch (err) {
        prompt("✅ Kopiere das Transkript manuell (Strg+C):", text);
      }
    })();
  }
};

// href-Methode analog zum Template
if (!YT_Transcript.href) {
  YT_Transcript.href = function (options) {
    options = options || {};
    const {
      encode = true,
      stripComments = true,
      collapseWhitespace = true,
      removeNewlines = true,
      debug = false
    } = options;

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
window.bookmarklets[YT_Transcript.meta.id] = YT_Transcript;
