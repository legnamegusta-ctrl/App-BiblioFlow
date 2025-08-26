export function initPage(app){
  let mode = 'cron';
  let running = false;
  let totalSegundos = 0;
  let inicioSessao = null;
  let id = null;
  const disp = document.getElementById('display');
  const btnCron = document.getElementById('btn-cron');
  const btnTimer = document.getElementById('btn-timer');
  const cfg = document.getElementById('timer-config');
  const inpMin = document.getElementById('timer-min');
  const inpSec = document.getElementById('timer-sec');
  const btnPlay = document.getElementById('btn-play');
  const btnCancel = document.getElementById('btn-cancel');
  const btnOk = document.getElementById('btn-ok');
  const historicoEl = document.getElementById('historico');

  function fmt(seg){
    const mm = String(Math.floor(seg/60)).padStart(2,'0');
    const ss = String(seg % 60).padStart(2,'0');
    disp.textContent = `${mm}:${ss}`;
  }
  function tick(){
    if(mode==='cron'){ totalSegundos++; }
    else { totalSegundos--; if(totalSegundos<=0){ totalSegundos=0; stop(); app.toast('Tempo concluído!'); } }
    fmt(totalSegundos);
  }
  function start(){
    if(running) return;
    running=true;
    btnPlay.textContent='Pausar';
    if(mode==='timer' && totalSegundos===0){
        totalSegundos = (Number(inpMin.value)||0) * 60 + (Number(inpSec.value)||0);
        fmt(totalSegundos);
    }
    inicioSessao = Date.now();
    id = setInterval(tick, 1000);
  }
  function stop(){
    running=false;
    clearInterval(id);
    id=null;
    btnPlay.textContent='Iniciar';
  }
  function cancel(){
    stop();
    totalSegundos = 0;
    fmt(totalSegundos);
    btnPlay.textContent='Iniciar';
  }

  function addHistorico(){
    const hist = JSON.parse(localStorage.getItem('temp_hist') || '[]');
    const tempoSessao = Math.floor((Date.now() - inicioSessao) / 1000);
    hist.unshift({ time: tempoSessao, date: new Date().toISOString().slice(0,10) });
    localStorage.setItem('temp_hist', JSON.stringify(hist.slice(0, 5)));
    renderHistorico();
  }
  function addHistoricoTimer(){
    const tempoUsado = (Number(inpMin.value)||0) * 60 + (Number(inpSec.value)||0);
    const tempoConcluido = tempoUsado - totalSegundos;
    const hist = JSON.parse(localStorage.getItem('temp_hist') || '[]');
    hist.unshift({ time: tempoConcluido, date: new Date().toISOString().slice(0,10) });
    localStorage.setItem('temp_hist', JSON.stringify(hist.slice(0, 5)));
    renderHistorico();
  }

  function renderHistorico(){
    const hist = JSON.parse(localStorage.getItem('temp_hist') || '[]');
    historicoEl.innerHTML = hist.map(h => `<div class="badge">${h.date} - ${Math.floor(h.time/60)}m ${h.time%60}s</div>`).join('');
  }

  btnCron.addEventListener('click', ()=>{ stop(); mode='cron'; cfg.classList.add('hidden'); totalSegundos=0; fmt(totalSegundos); });
  btnTimer.addEventListener('click', ()=>{ stop(); mode='timer'; cfg.classList.remove('hidden'); totalSegundos=0; fmt(totalSegundos); });
  btnPlay.addEventListener('click', ()=>{ running? stop() : start(); });
  btnCancel.addEventListener('click', cancel);
  btnOk.addEventListener('click', ()=>{
    stop();
    if(mode === 'cron') { addHistorico(); }
    else { addHistoricoTimer(); }
    cancel();
    app.toast('Sessão de leitura salva!');
  });

  fmt(totalSegundos);
  renderHistorico();
}