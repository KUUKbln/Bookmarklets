/**
 * bookmarklet-yt-copy-transcript.js
 *
 * Beschreibung:
 * Dieses Bookmarklet extrahiert das Transkript eines YouTube-Videos (sofern offen)
 * und bietet zwei Exportmoeglichkeiten:
 *
 * 1 - Export als VTT-Datei mit Zeitmarken (standard-konform)
 * 2 - Export als Fliesstext mit Zeitmarken alle 30 Sekunden (zur Weiterverarbeitung)
 *
 * Voraussetzungen:
 * - Das Transkript muss sichtbar geoeffnet sein (#segments-container im DOM)
 * - Funktioniert auf Desktop-Browsern (Chrome, Chromium, Firefox etc.)
 * - Keine externen Abhaengigkeiten, reine DOM-Verarbeitung
 *
 * Autor: ChatGPT (OpenAI)
 * Datum: 2025-08-29
 */

// javascript:void%20function(){(function(){function%20e(e){var%20t=e.split(%22:%22).map(Number);return%202===t.length%3F60*t[0]+t[1]:3===t.length%3F3600*t[0]+60*t[1]+t[2]:0}function%20t(e){var%20t=String(Math.floor(e/3600)).padStart(2,%220%22),r=String(Math.floor(e%253600/60)).padStart(2,%220%22),n=String((e%2560).toFixed(3)).padStart(6,%220%22);return%20t+%22:%22+r+%22:%22+n.replace(%22.%22,%22,%22)}function%20r(e){var%20t=document.createElement(%22textarea%22);t.value=e,document.body.appendChild(t),t.select();try{var%20r=document.execCommand(%22copy%22);return%20document.body.removeChild(t),r}catch(n){return%20document.body.removeChild(t),!1}}var%20n=document.querySelector(%22%23segments-container%22);if(!n)return%20void%20alert(%22Kein%20Transkript-Container%20gefunden.%22);var%20a=Array.from(n.querySelectorAll(%22ytd-transcript-segment-renderer%22));if(!a.length)return%20void%20alert(%22Keine%20Segmente%20gefunden.%22);for(var%20i=[],o=[],l=0;l%3Ca.length;l++){var%20d=a[l],u=d.querySelector(%22.segment-timestamp%22),p=d.querySelector(%22.segment-text%22);if(u%26%26p){var%20c=u.textContent.trim(),m=p.textContent.trim();c%26%26m%26%26(i.push(e(c)),o.push(m))}}if(!i.length)return%20void%20alert(%22Keine%20gueltigen%20Zeitstempel%20gefunden.%22);var%20g=prompt(%22Ausgabe-Modus:\n1%20-%20VTT%20Datei\n2%20-%20Fliesstext%20kopieren%22);if(%221%22!==g%26%26%222%22!==g)return%20void%20alert(%22Abbruch%20oder%20ungueltige%20Eingabe%22);if(%221%22===g){for(var%20v=%22WEBVTT\n\n%22,s=0;s%3Ci.length;s++){var%20f=i[s],h=s%3Ci.length-1%3Fi[s+1]:f+2;v+=s+1+%22\n%22+t(f)+%22%20--%3E%20%22+t(h)+%22\n%22+o[s]+%22\n\n%22}var%20b=document.title.replace(/[\\\/:*%3F%22%3C%3E|]/g,%22%22).trim()||%22transcript%22,k=prompt(%22Dateiname%20fuer%20das%20Transkript%22,b+%22.vtt%22)||b+%22.vtt%22,S=new%20Blob([v],{type:%22text/vtt%22}),T=URL.createObjectURL(S),y=document.createElement(%22a%22);y.href=T,y.download=k,document.body.appendChild(y),y.click(),document.body.removeChild(y),URL.revokeObjectURL(T),alert(%22VTT-Datei%20wurde%20erstellt%20und%20zum%20Download%20angeboten.%22)}else%20if(%222%22===g){for(var%20w=[],x=-30,C=0;C%3Ci.length;C++)if(i[C]-x%3E=30){var%20B=Math.floor(i[C]/3600),M=Math.floor(i[C]%253600/60),A=Math.floor(i[C]%2560),F=%22\n[%22+String(B).padStart(2,%220%22)+%22:%22+String(M).padStart(2,%220%22)+%22:%22+String(A).padStart(2,%220%22)+%22]%20%22;w.push(F+o[C]),x=i[C]}else%20w.push(%22%20%22+o[C]);var%20q=w.join(%22%22);if(navigator.clipboard%26%26navigator.clipboard.writeText)navigator.clipboard.writeText(q).then(function(){alert(%22Transkript%20wurde%20in%20die%20Zwischenablage%20kopiert.%22)},function(){var%20e=r(q);e%3Falert(%22Transkript%20wurde%20(Fallback)%20in%20die%20Zwischenablage%20kopiert.%22):(alert(%22Fehler%20beim%20Kopieren.%20Bitte%20manuell%20kopieren:\n\n%22+q),prompt(%22Bitte%20kopiere%20den%20Text:%22,q))});else{var%20D=r(q);D%3Falert(%22Transkript%20wurde%20(Fallback)%20in%20die%20Zwischenablage%20kopiert.%22):(alert(%22Clipboard%20API%20nicht%20verfuegbar.%20Bitte%20manuell%20kopieren:\n\n%22+q),prompt(%22Bitte%20kopiere%20den%20Text:%22,q))}}})()}();
javascript:(function(){

  // Zeitstring (hh:mm:ss oder mm:ss) nach Sekunden konvertieren
  function timeStrToSeconds(t){
    var parts = t.split(':').map(Number);
    if(parts.length === 2) return parts[0]*60 + parts[1];
    if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    return 0;
  }

  // Sekunden ins VTT-Zeitformat konvertieren (hh:mm:ss,mmm)
  function formatTime(s){
    var h = String(Math.floor(s/3600)).padStart(2,'0');
    var m = String(Math.floor((s%3600)/60)).padStart(2,'0');
    var sec = String((s%60).toFixed(3)).padStart(6,'0');
    return h + ':' + m + ':' + sec.replace('.', ',');
  }

  // Fallback-Kopierfunktion ueber ein verstecktes Textfeld
  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      var successful = document.execCommand('copy');
      document.body.removeChild(ta);
      return successful;
    } catch(e){
      document.body.removeChild(ta);
      return false;
    }
  }

  // Transkript-Container suchen
  var container = document.querySelector('#segments-container');
  if(!container){ alert('Kein Transkript-Container gefunden.'); return; }

  // Alle Transkript-Segmente extrahieren
  var segments = Array.from(container.querySelectorAll('ytd-transcript-segment-renderer'));
  if(!segments.length){ alert('Keine Segmente gefunden.'); return; }

  var starts = [], texts = [];

  // Zeit und Text jedes Segments sammeln
  for(var i = 0; i < segments.length; i++){
    var seg = segments[i];
    var timeEl = seg.querySelector('.segment-timestamp');
    var textEl = seg.querySelector('.segment-text');
    if(!timeEl || !textEl) continue;
    var timeText = timeEl.textContent.trim();
    var textText = textEl.textContent.trim();
    if(timeText && textText){
      starts.push(timeStrToSeconds(timeText));
      texts.push(textText);
    }
  }

  if(!starts.length){ alert('Keine gueltigen Zeitstempel gefunden.'); return; }

  // Modus-Abfrage: VTT-Datei oder Fliesstext
  var mode = prompt('Ausgabe-Modus:\n1 - VTT Datei\n2 - Fliesstext kopieren');
  if(mode !== '1' && mode !== '2'){ alert('Abbruch oder ungueltige Eingabe'); return; }

  // Modus 1: VTT-Datei generieren und herunterladen
  if(mode === '1'){
    var vtt = 'WEBVTT\n\n';
    for(var j = 0; j < starts.length; j++){
      var start = starts[j];
      var end = (j < starts.length - 1) ? starts[j + 1] : start + 2;
      vtt += (j+1) + '\n' + formatTime(start) + ' --> ' + formatTime(end) + '\n' + texts[j] + '\n\n';
    }

    // Dateiname aus Seitentitel ableiten
    var titleRaw = document.title.replace(/[\\\/:*?"<>|]/g,'').trim() || 'transcript';
    var filename = prompt('Dateiname fuer das Transkript', titleRaw + '.vtt') || titleRaw + '.vtt';

    // Datei erzeugen und zum Download anbieten
    var blob = new Blob([vtt], { type: 'text/vtt' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('VTT-Datei wurde erstellt und zum Download angeboten.');
  }

  // Modus 2: Fliesstext mit Zeitmarken alle 30 Sekunden
  else if(mode === '2'){
    var lines = [];
    var lastMark = -30;

    for(var k = 0; k < starts.length; k++){
      if(starts[k] - lastMark >= 30){
        var h = Math.floor(starts[k]/3600);
        var m = Math.floor((starts[k]%3600)/60);
        var s = Math.floor(starts[k]%60);
        var timeStr = '\n[' +
          String(h).padStart(2,'0') + ':' +
          String(m).padStart(2,'0') + ':' +
          String(s).padStart(2,'0') + '] ';
        lines.push(timeStr + texts[k]);
        lastMark = starts[k];
      } else {
        lines.push(' ' + texts[k]);
      }
    }

    var plainText = lines.join('');

    // Kopieren in die Zwischenablage mit Fallback
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(plainText).then(function(){
        alert('Transkript wurde in die Zwischenablage kopiert.');
      }, function(){
        var ok = fallbackCopy(plainText);
        if(ok) alert('Transkript wurde (Fallback) in die Zwischenablage kopiert.');
        else {
          alert('Fehler beim Kopieren. Bitte manuell kopieren:\n\n' + plainText);
          prompt('Bitte kopiere den Text:', plainText);
        }
      });
    } else {
      var ok = fallbackCopy(plainText);
      if(ok) alert('Transkript wurde (Fallback) in die Zwischenablage kopiert.');
      else {
        alert('Clipboard API nicht verfuegbar. Bitte manuell kopieren:\n\n' + plainText);
        prompt('Bitte kopiere den Text:', plainText);
      }
    }
  }

})();

