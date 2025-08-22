import { uid, firestore } from '../js/utils.js';
export function initPage(app){
  const lista = document.getElementById('lista');
  const busca = document.getElementById('busca');
  const btnAdd = document.getElementById('btn-add');

  async function render(){
    const readings = await app.getReadings();
    const q = (busca.value||'').toLowerCase();
    const items = readings.filter(r=> r.titulo.toLowerCase().includes(q));
    lista.innerHTML = items.map(r=> card(r)).join('') || '<div class="badge">Nenhuma leitura.</div>';
    lista.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', ()=> openForm(btn.dataset.id)));
  }
  function card(r){
    const tipoStr = r.origem==='Acervo' ? 'Livro do Acervo' : `Terceiro: ${r.terceiro||''}`;
    return `<div class="card fade-in">
      <div class="row" style="justify-content:space-between">
        <div><div style="font-weight:700">${r.titulo}</div><div class="badge">${tipoStr} • Fim: ${r.fim||'-'}</div></div>
        <button class="btn btn-ghost" data-edit data-id="${r.id}">Editar</button>
      </div>
      ${r.comentario? `<div style="margin-top:8px; color:var(--bf-muted)">“${r.comentario}”</div>`: ''}
    </div>`;
  }
  async function openForm(id){
    const all = await app.getReadings();
    const books = await app.getBooks();
    const it = all.find(x=>x.id===id) || { id: uid('l'), origem:'Acervo', titulo:'', autor:'', terceiro:'', inicio:'', fim:'', comentario:'' };
    const el = document.createElement('div');
    el.innerHTML = `
      <form class="grid" id="frm">
        <div class="row">
          ${['Acervo','Terceiro'].map(t=> `<button type="button" class="btn btn-ghost origbtn ${it.origem===t?'active':''}" data-val="${t}">${t}</button>`).join('')}
        </div>
        <div id="orig-acervo">
          <div class="field"><label class="label">Livro do Acervo</label>
            <select id="f-livro" class="input">${books.map(b=> `<option ${b.titulo===it.titulo?'selected':''}>${b.titulo}</option>`).join('')}</select>
          </div>
        </div>
        <div id="orig-terceiro" class="${it.origem==='Terceiro'?'':'hidden'}">
          <div class="field"><label class="label">Título</label><input id="f-titulo" class="input" value="${it.titulo||''}"></div>
          <div class="field"><label class="label">Autor</label><input id="f-autor" class="input" value="${it.autor||''}"></div>
          <div class="field"><label class="label">Nome do Terceiro</label><input id="f-terceiro" class="input" value="${it.terceiro||''}"></div>
        </div>
        <div class="grid2">
          <div class="field"><label class="label">Início</label><input id="f-inicio" type="date" class="input" value="${it.inicio||''}"></div>
          <div class="field"><label class="label">Fim *</label><input id="f-fim" type="date" class="input" value="${it.fim||''}" required></div>
        </div>
        <div class="field"><label class="label">Comentários</label><textarea id="f-coment" class="input" rows="3">${it.comentario||''}</textarea></div>
        <div class="row" style="justify-content:flex-end">
          ${all.some(x=>x.id===it.id) ? '<button type="button" class="btn btn-ghost" id="btn-del">Excluir</button>' : ''}
          <button type="button" class="btn btn-ghost" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn-cta">Salvar</button>
        </div>
      </form>`;
    const modal = app.openModal(all.some(x=>x.id===it.id)? 'Editar Leitura' : 'Adicionar Leitura', el);
    const origBtns = el.querySelectorAll('.origbtn');
    const acervoBox = el.querySelector('#orig-acervo');
    const terceiroBox = el.querySelector('#orig-terceiro');
    origBtns.forEach(b=> b.addEventListener('click', ()=>{
      origBtns.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      it.origem = b.dataset.val;
      acervoBox.classList.toggle('hidden', it.origem!=='Acervo');
      terceiroBox.classList.toggle('hidden', it.origem!=='Terceiro');
    }));
    el.querySelector('#btn-cancel').addEventListener('click', modal.close);
    const del = el.querySelector('#btn-del');
    if(del) del.addEventListener('click', async ()=>{
      if(confirm('Excluir leitura?')){
        await firestore.del(app.db, app.uid, 'readings', it.id);
        modal.close(); render(); app.toast('Leitura excluída');
      }
    });
    el.querySelector('#frm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const updated = {...it};
      if(it.origem==='Acervo'){
        updated.titulo = el.querySelector('#f-livro').value;
        const b = books.find(x=>x.titulo===updated.titulo); updated.autor = b? b.autor : '';
      }else{
        updated.titulo = el.querySelector('#f-titulo').value.trim();
        updated.autor = el.querySelector('#f-autor').value.trim();
        updated.terceiro = el.querySelector('#f-terceiro').value.trim();
      }
      updated.inicio = el.querySelector('#f-inicio').value;
      updated.fim = el.querySelector('#f-fim').value;
      if(!updated.fim){ alert('A data de fim é obrigatória'); return; }
      updated.comentario = el.querySelector('#f-coment').value.trim();
      await firestore.set(app.db, app.uid, 'readings', updated.id, updated);
      modal.close(); render(); app.toast('Salvo');
    });
  }

  btnAdd.addEventListener('click', ()=> openForm());
  busca.addEventListener('input', render);
  render();
}