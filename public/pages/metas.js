
import { uid } from '../js/utils.js';
export function initPage(app){
  const lista = document.getElementById('lista');
  const btnAdd = document.getElementById('btn-add');

  function render(){
    const metas = app.getMetas();
    lista.innerHTML = metas.map(m=> card(m)).join('') || '<div class="badge">Nenhuma meta.</div>';
    lista.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', ()=> openForm(btn.dataset.id)));
  }
  function card(m){
    const subtitle = m.tipo==='numero' ? (m.periodo || '') : (m.prazo ? 'até '+m.prazo : '');
    const status = m.status ?? Math.min(100, m.tipo==='numero' ? Math.round(((m.feito||0)/(m.qtd||1))*100) : (m.concluida? 100 : 40));
    return `<div class="card fade-in">
      <div class="row" style="justify-content:space-between">
        <div><div style="font-weight:700">${m.titulo}</div><div class="badge">${subtitle}</div></div>
        <div style="color:var(--bf-primary); font-weight:700">${status}%</div>
      </div>
      <div style="height:8px; border-radius:8px; overflow:hidden; background:rgba(255,255,255,.1); margin-top:8px">
        <div style="height:100%; width:${status}%; background:var(--bf-primary)"></div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:8px"><button class="btn btn-ghost" data-edit data-id="${m.id}">Editar</button></div>
    </div>`;
  }

  function openForm(id){
    const all = app.getMetas();
    const draft = app.pullMetaDraft();
    let meta = all.find(x=>x.id===id) || { id: uid('m'), tipo:'numero', titulo:'', desc:'', qtd:10, periodo:'2025', livro:'', prazo:'' , checklist:['']};
    if(draft){
      // veio da Calculadora
      meta.tipo = 'prazo';
      meta.titulo = meta.titulo || 'Meta da Calculadora';
      meta.desc = draft.modo==='paginasPorDia' ? `Ler ${draft.porDia} pág/dia para ${draft.paginas} páginas` : `Concluir ${draft.paginas} páginas em ${draft.prazo} dias`;
    }
    const el = document.createElement('div');
    el.innerHTML = `
      <form class="grid" id="frm">
        <div class="field"><label class="label">Título</label><input id="f-titulo" class="input" value="${meta.titulo||''}" required></div>
        <div class="field"><label class="label">Descrição</label><textarea id="f-desc" class="input" rows="3">${meta.desc||''}</textarea></div>
        <div class="row">
          ${['numero','prazo','generica'].map(t=> `<button type="button" class="btn btn-ghost tipobtn ${meta.tipo===t?'active':''}" data-tipo="${t}">${t==='numero'?'Número de leituras': t==='prazo'?'Prazo':'Genérica'}</button>`).join('')}
        </div>
        <div id="tipo-numero" class="${meta.tipo==='numero'?'':'hidden'}">
          <div class="grid2">
            <div class="field"><label class="label">Quantidade</label><input id="f-qtd" type="number" class="input" value="${meta.qtd||10}"></div>
            <div class="field"><label class="label">Período</label><input id="f-periodo" class="input" value="${meta.periodo||''}"></div>
          </div>
        </div>
        <div id="tipo-prazo" class="${meta.tipo==='prazo'?'':'hidden'}">
          <div class="field"><label class="label">Livro (opcional)</label><input id="f-livro" class="input" value="${meta.livro||''}" placeholder="Escolha um livro específico"></div>
          <div class="field"><label class="label">Data limite</label><input id="f-prazo" type="date" class="input" value="${meta.prazo||''}"></div>
          <div class="field"><label class="label">Concluída?</label><select id="f-done" class="input"><option ${meta.concluida?'':'selected'} value="nao">Não</option><option ${meta.concluida?'selected':''} value="sim">Sim</option></select></div>
        </div>
        <div id="tipo-generica" class="${meta.tipo==='generica'?'':'hidden'}">
          <div class="grid" id="checklist-box">
            ${(meta.checklist||['']).map((c,i)=> rowChecklist(c,i)).join('')}
          </div>
          <button type="button" class="btn btn-ghost" id="btn-add-check">Adicionar item</button>
        </div>
        <div class="row" style="justify-content:flex-end">
          ${all.some(x=>x.id===meta.id)? '<button type="button" class="btn btn-ghost" id="btn-del">Excluir</button>' : ''}
          <button type="button" class="btn btn-ghost" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn-cta">Salvar</button>
        </div>
      </form>`;
    function rowChecklist(text, idx){
      return `<div class="row"><input class="input" data-idx="${idx}" value="${text||''}"><button type="button" class="btn btn-ghost" data-rm="${idx}">Remover</button></div>`;
    }
    const modal = app.openModal(all.some(x=>x.id===meta.id)? 'Editar Meta' : 'Nova Meta', el);
    const boxN = el.querySelector('#tipo-numero');
    const boxP = el.querySelector('#tipo-prazo');
    const boxG = el.querySelector('#tipo-generica');
    el.querySelectorAll('.tipobtn').forEach(b=> b.addEventListener('click', ()=>{
      el.querySelectorAll('.tipobtn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      meta.tipo = b.dataset.tipo;
      boxN.classList.toggle('hidden', meta.tipo!=='numero');
      boxP.classList.toggle('hidden', meta.tipo!=='prazo');
      boxG.classList.toggle('hidden', meta.tipo!=='generica');
    }));
    el.querySelector('#btn-cancel').addEventListener('click', modal.close);
    const del = el.querySelector('#btn-del');
    if(del) del.addEventListener('click', ()=>{
      if(confirm('Excluir meta?')){ app.setMetas(all.filter(x=>x.id!==meta.id)); modal.close(); render(); app.toast('Meta excluída'); }
    });
    const boxCL = el.querySelector('#checklist-box');
    const addCL = el.querySelector('#btn-add-check');
    addCL.addEventListener('click', ()=>{
      const idx = boxCL.querySelectorAll('input').length;
      boxCL.insertAdjacentHTML('beforeend', rowChecklist('', idx));
    });
    boxCL.addEventListener('click', (e)=>{
      if(e.target.matches('[data-rm]')){
        const row = e.target.closest('.row'); row.remove();
      }
    });
    el.querySelector('#frm').addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const updated = { ...meta };
      updated.titulo = el.querySelector('#f-titulo').value.trim();
      updated.desc = el.querySelector('#f-desc').value.trim();
      if(!updated.titulo){ alert('Título é obrigatório'); return; }
      if(updated.tipo==='numero'){
        updated.qtd = Number(el.querySelector('#f-qtd').value||0);
        updated.periodo = el.querySelector('#f-periodo').value.trim();
      }else if(updated.tipo==='prazo'){
        updated.livro = el.querySelector('#f-livro').value.trim();
        updated.prazo = el.querySelector('#f-prazo').value;
        updated.concluida = el.querySelector('#f-done').value==='sim';
      }else{
        updated.checklist = Array.from(boxCL.querySelectorAll('input')).map(i=> i.value.trim()).filter(Boolean);
      }
      const arr = app.getMetas();
      const idx = arr.findIndex(x=>x.id===updated.id);
      if(idx>=0) arr[idx]=updated; else arr.unshift(updated);
      app.setMetas(arr); modal.close(); render(); app.toast('Salvo');
    });
  }

  btnAdd.addEventListener('click', ()=> openForm());
  render();
}
