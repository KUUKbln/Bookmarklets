/**
 * bookmarklet-yt-export-vtt.js
 *
 * Beschreibung:
 * Dieses Bookmarklet extrahiert das geoeffnete Transkript eines YouTube-Videos
 * und speichert es lokal als VTT-Datei mit Zeitmarken (WEBVTT-Format).
 *
 * Voraussetzung: Das Transkript muss sichtbar im Browser geladen sein.
 *
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-08-29
 */

// javascript:void%20function(){(function(){function%20e(e){var%20t=e.split(%22:%22).map(Number);return%202===t.length%3F60*t[0]+t[1]:3===t.length%3F3600*t[0]+60*t[1]+t[2]:0}function%20t(e){var%20t=String(Math.floor(e/3600)).padStart(2,%220%22),r=String(Math.floor(e%253600/60)).padStart(2,%220%22),n=String((e%2560).toFixed(3)).padStart(6,%220%22);return%20t+%22:%22+r+%22:%22+n.replace(%22.%22,%22,%22)}var%20r=document.querySelector(%22%23segments-container%22);if(!r)return%20void%20alert(%22Kein%20Transkript-Container%20gefunden.%22);var%20n=Array.from(r.querySelectorAll(%22ytd-transcript-segment-renderer%22));if(!n.length)return%20void%20alert(%22Keine%20Segmente%20gefunden.%22);for(var%20a=[],i=[],o=0;o%3Cn.length;o++){var%20l=n[o],d=l.querySelector(%22.segment-timestamp%22),u=l.querySelector(%22.segment-text%22);if(d%26%26u){var%20c=d.textContent.trim(),m=u.textContent.trim();c%26%26m%26%26(a.push(e(c)),i.push(m))}}if(!a.length)return%20void%20alert(%22Keine%20gueltigen%20Zeitstempel%20gefunden.%22);for(var%20g=%22WEBVTT\n\n%22,p=0;p%3Ca.length;p++){var%20v=a[p],f=p%3Ca.length-1%3Fa[p+1]:v+2;g+=p+1+%22\n%22+t(v)+%22%20--%3E%20%22+t(f)+%22\n%22+i[p]+%22\n\n%22}var%20s=document.title.replace(/[\\\/:*%3F%22%3C%3E|]/g,%22%22).trim()||%22transcript%22,h=prompt(%22Dateiname%20fuer%20das%20Transkript%22,s+%22.vtt%22)||s+%22.vtt%22,S=new%20Blob([g],{type:%22text/vtt%22}),y=URL.createObjectURL(S),b=document.createElement(%22a%22);b.href=y,b.download=h,document.body.appendChild(b),b.click(),document.body.removeChild(b),URL.revokeObjectURL(y)})()}();

javascript:(function(){

  // Zeitstring (hh:mm:ss oder mm:ss) in Sekunden umwandeln
  function parseTime(e){
    var parts = e.split(':').map(Number);
    if(parts.length === 2) return parts[0]*60 + parts[1];
    if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    return 0;
  }

  // Sekunden ins VTT-Format konvertieren (hh:mm:ss,mmm)
  function formatTime(e){
    var h = String(Math.floor(e / 3600)).padStart(2, '0');
    var m = String(Math.floor((e % 3600) / 60)).padStart(2, '0');
    var s = String((e % 60).toFixed(3)).padStart(6, '0');
    return h + ':' + m + ':' + s.replace('.', ',');
  }

  // Transkript-Container ermitteln
  var container = document.querySelector('#segments-container');
  if(!container){ alert('Kein Transkript-Container gefunden.'); return; }

  // Alle Transkript-Zeilen sammeln
  var segments = Array.from(container.querySelectorAll('ytd-transcript-segment-renderer'));
  if(!segments.length){ alert('Keine Segmente gefunden.'); return; }

  var timestamps = [], texts = [];

  // Zeitmarken und Inhalte extrahieren
  for(var i = 0; i < segments.length; i++){
    var seg = segments[i];
    var timeEl = seg.querySelector('.segment-timestamp');
    var textEl = seg.querySelector('.segment-text');
    if(!timeEl || !textEl) continue;
    var timeText = timeEl.textContent.trim();
    var textText = textEl.textContent.trim();
    if(timeText && textText){
      timestamps.push(parseTime(timeText));
      texts.push(textText);
    }
  }

  if(!timestamps.length){ alert('Keine gueltigen Zeitstempel gefunden.'); return; }

  // VTT-Datei generieren
  var vtt = 'WEBVTT\n\n';
  for(var j = 0; j < timestamps.length; j++){
    var start = timestamps[j];
    var end = (j < timestamps.length - 1) ? timestamps[j+1] : start + 2;
    vtt += (j+1) + '\n' + formatTime(start) + ' --> ' + formatTime(end) + '\n' + texts[j] + '\n\n';
  }

  // Dateiname aus Titel ableiten
  var title = document.title.replace(/[\\\/:*?"<>|]/g, '').trim() || 'transcript';
  var filename = prompt('Dateiname fuer das Transkript', title + '.vtt') || title + '.vtt';

  // Download-Link erzeugen und automatisch klicken
  var blob = new Blob([vtt], { type: 'text/vtt' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

})();

