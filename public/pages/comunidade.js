
export function initPage(app){
  const amigos = document.getElementById('amigos');
  const feed = document.getElementById('feed');
  const pals = [{id:'u1', nome:'@ana', streak:5},{id:'u2', nome:'@joao', streak:12}];
  amigos.innerHTML = pals.map(a=> `<span class="chip">${a.nome} • 🔥${a.streak}</span>`).join('');
  const posts = [
    { id:'f1', user:'@ana', acao:'concluiu', item:'O Nome do Vento', quando:'2h' },
    { id:'f2', user:'@joao', acao:'comentou', item:'Contos de Machado', quando:'1d' },
  ];
  feed.innerHTML = posts.map(p=> `<div class="card"><div><span style="color:var(--bf-primary)">${p.user}</span> ${p.acao} <b>${p.item}</b></div><div class="badge">${p.quando} atrás • 👍 12 • 💬 3</div><div class="row" style="margin-top:8px"><button class="btn btn-ghost">Curtir</button><button class="btn btn-ghost">Comentar</button></div></div>`).join('');

  // Grupos e desafios
  const grupos = document.getElementById('grupos');
  grupos.innerHTML = ['Clube do Machado','Sci-Fi 2025'].map(g=> `<div class="chip">${g}</div>`).join('');
  document.getElementById('btn-novo-grupo').addEventListener('click', ()=> app.toast('Grupo criado (demo)'));
  const desafios = document.getElementById('desafios');
  desafios.innerHTML = ['Ler 5 contos até fim do mês','Ler 300 páginas em 10 dias'].map(d=> `<div class="card"><div>${d}</div><div class="row" style="margin-top:6px"><button class="btn btn-ghost">Participar</button></div></div>`).join('');
}
