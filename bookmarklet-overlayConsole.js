javascript:(function(){
  const id='aiConsoleOverlay';
  try {
    let existing=document.getElementById(id);
    if(existing){
      existing.remove();
      console.log=window.__aiConsoleLogOrig;
      console.error=window.__aiConsoleErrOrig;
      alert('AI Console geschlossen');
      return;
    }
    window.__aiConsoleLogOrig=console.log;
    window.__aiConsoleErrOrig=console.error;

    const ov=document.createElement('div');
    ov.id=id;
    Object.assign(ov.style,{
      position:'fixed',
      bottom:'0',
      left:'0',
      width:'100%',
      maxHeight:'35vh',
      background:'rgba(0,0,0,0.9)',
      color:'#eee',
      fontFamily:'monospace',
      fontSize:'12px',
      overflow:'hidden',
      zIndex:'2147483647',
      padding:'8px',
      boxSizing:'border-box',
      borderTop:'3px solid #0f0',
      userSelect:'text',
      display:'flex',
      gap:'8px'
    });

    const log=document.createElement('pre');
    Object.assign(log.style,{
      margin:'0',
      whiteSpace:'pre-wrap',
      wordBreak:'break-word',
      maxHeight:'calc(35vh - 16px)',
      overflowY:'auto',
      flex:'1',
      userSelect:'text',
      background:'#111',
      padding:'8px',
      borderRadius:'4px'
    });

    const btns=document.createElement('div');
    Object.assign(btns.style,{
      display:'flex',
      flexDirection:'column',
      gap:'6px',
      minWidth:'100px',
      alignItems:'stretch'
    });

    const btnCopy=document.createElement('button');
    btnCopy.textContent='📋 Kopieren';
    Object.assign(btnCopy.style,{
      background:'#222',
      color:'#0f0',
      border:'none',
      padding:'6px 8px',
      cursor:'pointer',
      fontSize:'12px',
      borderRadius:'4px'
    });
    btnCopy.onclick = () => {
      try {
        let lines = log.textContent.trim().split('\n');
        let last = lines.length > 0 ? lines[lines.length - 1] : '';
        if (!last) throw new Error('Keine letzte Nachricht gefunden');

        function fallbackCopyTextToClipboard(text) {
          var textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.top = "0";
          textArea.style.left = "0";
          textArea.style.width = "1px";
          textArea.style.height = "1px";
          textArea.style.padding = "0";
          textArea.style.border = "none";
          textArea.style.outline = "none";
          textArea.style.boxShadow = "none";
          textArea.style.background = "transparent";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            var successful = document.execCommand('copy');
            if(successful){
              alert('Letzte Nachricht kopiert:\n' + text);
            } else {
              alert('Clipboard-Zugriff verweigert');
            }
          } catch (err) {
            alert('Fehler beim Kopieren: ' + err);
          }

          document.body.removeChild(textArea);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(last).then(() => {
            alert('Letzte Nachricht kopiert:\n' + last);
          }).catch(() => {
            fallbackCopyTextToClipboard(last);
          });
        } else {
          fallbackCopyTextToClipboard(last);
        }
      } catch (e) {
        alert('Fehler: ' + e.message);
      }
    };

    const btnClear=document.createElement('button');
    btnClear.textContent='🗑 Clear';
    Object.assign(btnClear.style,{
      background:'#222',
      color:'#0f0',
      border:'none',
      padding:'6px 8px',
      cursor:'pointer',
      fontSize:'12px',
      borderRadius:'4px'
    });
    btnClear.onclick=()=>{
      // Log komplett leeren und Scroll auf Anfang setzen
      log.textContent='';
      log.scrollTop=0;
    };

    const btnClose=document.createElement('button');
    btnClose.textContent='✕ Schließen';
    Object.assign(btnClose.style,{
      background:'#222',
      color:'#0f0',
      border:'none',
      padding:'6px 8px',
      cursor:'pointer',
      fontSize:'12px',
      borderRadius:'4px'
    });
    btnClose.onclick=()=>{
      ov.remove();
      console.log=window.__aiConsoleLogOrig;
      console.error=window.__aiConsoleErrOrig;
      alert('AI Console geschlossen');
    };

    btns.appendChild(btnCopy);
    btns.appendChild(btnClear);
    btns.appendChild(btnClose);

    ov.appendChild(log);
    ov.appendChild(btns);
    document.body.appendChild(ov);

    function formatArgs(args){
      return args.map(a=>{
        try{
          if(typeof a==='object') return JSON.stringify(a);
          return String(a);
        }catch{
          return String(a);
        }
      }).join(' ');
    }

    console.log = function(...args){
      try{
        window.__aiConsoleLogOrig.apply(console, args);
        log.textContent += formatArgs(args) + '\n';
        log.scrollTop = log.scrollHeight;
      }catch(e){
        alert('Fehler in console.log Override: ' + e.message);
      }
    };

    console.error = function(...args){
      try{
        window.__aiConsoleErrOrig.apply(console, args);
        log.textContent += '❌ ' + formatArgs(args) + '\n';
        log.scrollTop = log.scrollHeight;
      }catch(e){
        alert('Fehler in console.error Override: ' + e.message);
      }
    };

    console.log('👋 AI Overlay Console gestartet. Erneut aufrufen zum Schließen.');

  } catch(e){
    alert('Fehler beim Starten der AI Console: ' + e.message);
  }
})();