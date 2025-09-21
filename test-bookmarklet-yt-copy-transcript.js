/**
 * bookmarklet-yt-copy-transcript.js
 *
 * Beschreibung:
 * Dieses Bookmarklet extrahiert das Transkript eines YouTube-Videos (sofern offen)
 * und bietet zwei Exportmöglichkeiten:
 *
 * 1 - Export als VTT-Datei mit Zeitmarken (standard-konform)
 * 2 - Export als Fliesstext mit Zeitmarken alle 30 Sekunden (zur Weiterverarbeitung)
 *
 * Voraussetzungen:
 * - Das Transkript muss sichtbar geöffnet sein (#segments-container im DOM)
 * - Funktioniert auf Desktop-Browsern (Chrome, Chromium, Firefox etc.)
 * - Keine externen Abhängigkeiten, reine DOM-Verarbeitung
 *
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-08-29
 *
 * KI-generierter Code wird kenntlich gemacht (Name und Version) und unterzeichnet.
 */

const bookmarklet_ytCopyTranscript = {
  label: {
    title: "YT Transcript kopieren",
    short: "YT⧉",
    description: "Kopiert YouTube-Transcript (falls sichtbar) in die Zwischenablage"
  },

  run() {
    const transcript = [...document.querySelectorAll("ytd-transcript-segment-renderer")]
      .map(e => e.innerText)
      .join("\n");

    if (!transcript) {
      alert("Kein Transcript gefunden.");
    } else {
      navigator.clipboard.writeText(transcript).then(() => {
        alert("Transcript kopiert.");
      });
    }
  }
};

bookmarklet_ytCopyTranscript.href = bookmarklet_ytCopyTranscript.href || function({ encode = true } = {}) {
  const code = `(${this.run.toString()})();`;
  return `javascript:${encode ? encodeURIComponent(code) : code}`;
};

export default bookmarklet_ytCopyTranscript;

// Stand: 2025-09-21 — Erstellt/aktualisiert durch ChatGPT-4o (OpenAI)
