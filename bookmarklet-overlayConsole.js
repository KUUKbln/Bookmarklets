//bookmarklet-overlayConsole.js

javascript:(()=>{
  const id='aiConsoleOverlay';
  let existing=document.getElementById(id);
  if(existing){
    existing.remove();
    window.__aiConsoleLog=console.log;
    window.__aiConsoleError=console.error;
    return;
  }
  // Backup Originale
  window.__aiConsoleLog=console.log;
  window.__aiConsoleError=console.error;

  // Create overlay container
  const ov=document.createElement('div');
  ov.id=id;
  ov.style.position='fixed';
  ov.style.bottom='0';
  ov.style.left='0';
  ov.style.width='100%';
  ov.style.maxHeight='30vh';
  ov.style.background='rgba(0,0,0,0.85)';
  ov.style.color='#eee';
  ov.style.fontFamily='monospace';
  ov.style.fontSize='12px';
  ov.style.overflowY='auto';
  ov.style.zIndex='2147483647';
  ov.style.padding='8px';
  ov.style.boxSizing='border-box';
  ov.style.borderTop='2px solid #0f0';

  // Close Button
  const btn=document.createElement('button');
  btn.textContent='✕ Konsole schließen';
  btn.style.position='absolute';
  btn.style.top='4px';
  btn.style.right='8px';
  btn.style.background='#222';
  btn.style.color='#0f0';
  btn.style.border='none';
  btn.style.padding='4px 8px';
  btn.style.cursor='pointer';
  btn.style.fontSize='12px';
  btn.onclick=()=>{ov.remove();console.log=window.__aiConsoleLog;console.error=window.__aiConsoleError};

  ov.appendChild(btn);

  // Log container
  const log=document.createElement('pre');
  log.style.margin='0';
  log.style.whiteSpace='pre-wrap';
  log.style.wordBreak='break-word';
  ov.appendChild(log);

  document.body.appendChild(ov);

  // Helper to format args
  function formatArgs(args){
    return args.map(a=>{
      try{
        if(typeof a==='object')return JSON.stringify(a);
        return String(a);
      }catch{return String(a);}
    }).join(' ');
  }

  // Override console.log and console.error
  console.log=function(...args){
    window.__aiConsoleLog.apply(console, args);
    log.textContent+=formatArgs(args)+'\n';
    log.scrollTop=log.scrollHeight;
  }
  console.error=function(...args){
    window.__aiConsoleError.apply(console, args);
    log.textContent+='❌ '+formatArgs(args)+'\n';
    log.scrollTop=log.scrollHeight;
  }

  console.log('📟 AI Overlay Console gestartet. Bookmarklet nochmal aufrufen zum Schließen.');
})();