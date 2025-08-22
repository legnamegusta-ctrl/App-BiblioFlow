import { uid, firestore } from '../js/utils.js';
export function initPage(app){
  const lista = document.getElementById('lista');
  const busca = document.getElementById('busca');
  const btnAdd = document.getElementById('btn-add');
  const btnOrdenar = document.getElementById('btn-ordenar');
  let ordem = 'az';

  async function render(){
    const books = await app.getBooks();
    const q = (busca.value||'').toLowerCase();
    let items = books.filter(b=> b.titulo.toLowerCase().includes(q));
    items = items.sort((a,b)=> ordem==='az' ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo));
    lista.innerHTML = items.map(b=> card(b)).join('');
    lista.querySelectorAll('.row-toggle').forEach(btn => btn.addEventListener('click', toggle));
    lista.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', ()=> openForm(btn.dataset.id)));
  }

  function card(b){
    const tags = (b.temas||[]).map(t=> `<span class="chip">#${t}</span>`).join(' ');
    return `<div class="card fade-in">
      <div class="row" style="justify-content:space-between">
        <div><div style="font-weight:700">${b.titulo}</div><div class="badge">${b.autor} ${b.ano? '• '+b.ano:''}</div></div>
        <button class="btn btn-ghost row-toggle" data-id="${b.id}">Detalhes</button>
      </div>
      <div id="det-${b.id}" class="hidden" style="margin-top:8px">
        <div class="row" style="gap:6px">${tags}</div>
        <div class="grid" style="grid-template-columns: repeat(2, minmax(0,1fr)); font-size:13px; color:var(--bf-muted)">
          <div><span>Tipo:</span> ${b.tipo}</div>
          ${b.coletanea? `<div><span>Coletânea:</span> ${b.coletanea}</div>`: ''}
          ${b.editora? `<div><span>Editora:</span> ${b.editora}</div>`: ''}
          ${b.paginas? `<div><span>Páginas:</span> ${b.paginas}</div>`: ''}
          ${b.origem? `<div><span>Origem:</span> ${b.origem}</div>`: ''}
          ${b.local? `<div><span>Local:</span> ${b.local}</div>`: ''}
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:8px">
          <button class="btn btn-ghost" data-edit data-id="${b.id}">Editar</button>
        </div>
      </div>
    </div>`;
  }

  function toggle(e){
    const id = e.currentTarget.dataset.id;
    document.getElementById('det-'+id).classList.toggle('hidden');
  }

  async function openForm(id){
    const all = await app.getBooks();
    const book = all.find(x=>x.id===id) || { id: uid('b'), tipo:'Livro Próprio', titulo:'', autor:'', editora:'', ano:'', paginas:'', temas:[], origem:'', local:'' };
    const el = document.createElement('div');
    el.innerHTML = `
      <form class="grid" id="frm">
        <div class="row">
          ${['Livro Próprio','Parte de Livro','Coletânea'].map(t=> `<button type="button" class="btn btn-ghost tipobtn ${book.tipo===t?'active':''}" data-tipo="${t}">${t}</button>`).join('')}
        </div>
        <div class="field"><label class="label">Título *</label><input required id="f-titulo" class="input" value="${book.titulo}"></div>
        <div class="grid2">
          <div class="field"><label class="label">Autor</label><input id="f-autor" class="input" value="${book.autor||''}"></div>
          <div class="field"><label class="label">Editora</label><input id="f-editora" class="input" value="${book.editora||''}"></div>
        </div>
        <div class="grid2">
          <div class="field"><label class="label">Edição</label><input id="f-edicao" class="input" value="${book.edicao||''}"></div>
          <div class="field"><label class="label">Ano</label><input id="f-ano" class="input" value="${book.ano||''}"></div>
        </div>
        <div class="field"><label class="label">Número de páginas</label><input id="f-paginas" class="input" type="number" value="${book.paginas||''}"></div>
        <div class="field"><label class="label">Temas (tags, separadas por vírgula)</label><input id="f-temas" class="input" value="${(book.temas||[]).join(', ')}"></div>
        <div class="grid2">
          <div class="field"><label class="label">Origem</label><input id="f-origem" class="input" value="${book.origem||''}" placeholder="presente, compra, etc."></div>
          <div class="field"><label class="label">Local</label><input id="f-local" class="input" value="${book.local||''}" placeholder="onde está guardado"></div>
        </div>
        <div class="field ${book.tipo==='Parte de Livro' ? '' : 'hidden'}" id="coletanea-wrap">
          <label class="label">Coletânea</label>
          <select id="f-coletanea" class="input"></select>
        </div>
        <div class="field">
          <label class="label">ISBN (opcional)</label>
          <div class="row"><input id="f-isbn" class="input" placeholder="978..."><button type="button" class="btn btn-ghost" id="btn-isbn">Buscar</button></div>
          <div class="badge" id="isbn-status"></div>
        </div>
        <div class="row" style="justify-content:flex-end; gap:8px">
          ${all.some(x=>x.id===book.id) ? '<button type="button" class="btn btn-ghost" id="btn-del">Excluir</button>' : ''}
          <button type="button" class="btn btn-ghost" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn-cta">Salvar</button>
        </div>
      </form>`;

    const modal = app.openModal(all.some(x=>x.id===book.id)? 'Editar Livro' : 'Adicionar Livro', el);
    const frm = el.querySelector('#frm');
    const wrap = el.querySelector('#coletanea-wrap');
    const sel = el.querySelector('#f-coletanea');
    const coles = all.filter(x=>x.tipo==='Coletânea').map(x=>x.titulo);
    sel.innerHTML = (coles.length? coles : ['—']).map(t=> `<option ${t===book.coletanea?'selected':''}>${t}</option>`).join('');
    const typeButtons = el.querySelectorAll('.tipobtn');
    typeButtons.forEach(b=> b.addEventListener('click', ()=>{
      typeButtons.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      book.tipo = b.dataset.tipo;
      wrap.classList.toggle('hidden', book.tipo!=='Parte de Livro');
    }));
    el.querySelector('#btn-cancel').addEventListener('click', modal.close);
    const del = el.querySelector('#btn-del');
    if(del) del.addEventListener('click', async ()=>{
      if(confirm('Excluir este livro do acervo?')){
        await firestore.del(app.db, app.uid, 'books', book.id);
        modal.close(); render(); app.toast('Livro excluído');
      }
    });

    const btnIsbn = el.querySelector('#btn-isbn');
    const isbnStatus = el.querySelector('#isbn-status');
    btnIsbn.addEventListener('click', async ()=>{
      const isbn = el.querySelector('#f-isbn').value.trim();
      if(!isbn){ isbnStatus.textContent='Informe um ISBN'; return; }
      isbnStatus.textContent='Consultando...';
      try{
        const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`);
        const j = await r.json();
        const info = j.items && j.items[0] && j.items[0].volumeInfo;
        if(!info){ isbnStatus.textContent='Não encontrado'; return; }
        el.querySelector('#f-titulo').value = info.title || '';
        el.querySelector('#f-autor').value = (info.authors||[]).join(', ');
        el.querySelector('#f-editora').value = info.publisher || '';
        el.querySelector('#f-ano').value = (info.publishedDate||'').slice(0,4);
        el.querySelector('#f-paginas').value = info.pageCount || '';
        isbnStatus.textContent='Pré-preenchido ✓';
      }catch(e){ isbnStatus.textContent='Erro ao buscar'; }
    });

    frm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const updated = {
        ...book,
        titulo: el.querySelector('#f-titulo').value.trim(),
        autor: el.querySelector('#f-autor').value.trim(),
        editora: el.querySelector('#f-editora').value.trim(),
        edicao: el.querySelector('#f-edicao').value.trim(),
        ano: el.querySelector('#f-ano').value.trim(),
        paginas: Number(el.querySelector('#f-paginas').value||0),
        temas: el.querySelector('#f-temas').value.split(',').map(s=>s.trim()).filter(Boolean),
        origem: el.querySelector('#f-origem').value.trim(),
        local: el.querySelector('#f-local').value.trim(),
        coletanea: wrap.classList.contains('hidden') ? undefined : el.querySelector('#f-coletanea').value
      };
      if(!updated.titulo){ alert('Título é obrigatório'); return; }
      await firestore.set(app.db, app.uid, 'books', updated.id, updated);
      modal.close(); render(); app.toast('Salvo');
    });
  }

  btnAdd.addEventListener('click', ()=> openForm());
  btnOrdenar.addEventListener('click', ()=>{ ordem = ordem==='az'?'za':'az'; render(); });
  busca.addEventListener('input', render);
  render();
}