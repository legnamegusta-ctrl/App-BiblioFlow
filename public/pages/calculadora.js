
import { computeDays, computePagesPerDay } from '../js/utils.js';
export function initPage(app){
  let modo = 'pd'; // pd | df
  const paginas = document.getElementById('paginas');
  const porDia = document.getElementById('porDia');
  const prazo = document.getElementById('prazo');
  const fldPd = document.getElementById('fld-pd');
  const fldDf = document.getElementById('fld-df');
  const resLabel = document.getElementById('res-label');
  const resExtra = document.getElementById('res-extra');
  const btnPd = document.getElementById('modo-pd');
  const btnDf = document.getElementById('modo-df');
  const btnCriar = document.getElementById('btn-criar-meta');

  function update(){
    const p = Number(paginas.value||0);
    if(modo==='pd'){
      const d = computeDays(p, Number(porDia.value||1));
      resLabel.textContent = `Você precisa de ${d} dia(s).`;
      resExtra.textContent = `Termina em ~${d} dia(s).`;
    }else{
      const pd = computePagesPerDay(p, Number(prazo.value||1));
      resLabel.textContent = `Ler ${pd} pág/dia.`;
      resExtra.textContent = `Em ${prazo.value} dia(s) você conclui.`;
    }
  }
  btnPd.addEventListener('click', ()=>{ modo='pd'; fldPd.classList.remove('hidden'); fldDf.classList.add('hidden'); update(); });
  btnDf.addEventListener('click', ()=>{ modo='df'; fldDf.classList.remove('hidden'); fldPd.classList.add('hidden'); update(); });
  [paginas, porDia, prazo].forEach(el=> el.addEventListener('input', update));
  update();

  btnCriar.addEventListener('click', ()=>{
    const draft = modo==='pd' ? { modo:'paginasPorDia', paginas:Number(paginas.value||0), porDia:Number(porDia.value||1) }
                              : { modo:'dataFinal', paginas:Number(paginas.value||0), prazo:Number(prazo.value||1) };
    app.setMetaDraft(draft);
    app.navTo('metas');
  });
}
