
export function initPage(app){
  let mode = 'cron'; // cron | timer
  let running = false;
  let ms = 0;
  let id = null;
  const disp = document.getElementById('display');
  const btnCron = document.getElementById('btn-cron');
  const btnTimer = document.getElementById('btn-timer');
  const cfg = document.getElementById('timer-config');
  const inpSeg = document.getElementById('timer-seg');
  const btnPlay = document.getElementById('btn-play');
  const btnCancel = document.getElementById('btn-cancel');
  const btnOk = document.getElementById('btn-ok');

  function fmt(){
    const mm = String(Math.floor(ms/60000)).padStart(2,'0');
    const ss = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
    const cs = String(Math.floor((ms%1000)/100));
    disp.textContent = `${mm}:${ss}.${cs}`;
  }
  function tick(){
    if(mode==='cron'){ ms+=100; }
    else { ms-=100; if(ms<=0){ ms=0; stop(); } }
    fmt();
  }
  function start(){
    if(running) return; running=true;
    if(mode==='timer'){ ms = Math.max(0, Number(inpSeg.value||0)*1000); }
    id = setInterval(tick, 100);
  }
  function stop(){ running=false; clearInterval(id); id=null; btnPlay.textContent='Iniciar'; }
  function cancel(){ stop(); ms = mode==='timer'? Math.max(0, Number(inpSeg.value||0)*1000) : 0; fmt(); }

  btnCron.addEventListener('click', ()=>{ stop(); mode='cron'; cfg.classList.add('hidden'); ms=0; fmt(); });
  btnTimer.addEventListener('click', ()=>{ stop(); mode='timer'; cfg.classList.remove('hidden'); ms=Math.max(0, Number(inpSeg.value||0)*1000); fmt(); });
  btnPlay.addEventListener('click', ()=>{ running? stop() : start(); btnPlay.textContent = running? 'Pausar':'Iniciar'; });
  btnCancel.addEventListener('click', cancel);
  btnOk.addEventListener('click', ()=>{ stop(); app.toast('Concluído'); });

  fmt();
}
