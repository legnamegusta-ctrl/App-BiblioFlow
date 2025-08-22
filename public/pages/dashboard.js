
export async function initPage(app){
  const books = await app.getBooks();
  const readings = await app.getReadings();
  const metas = await app.getMetas();
  const autores = new Set(books.map(b=>b.autor)).size;
  const streak = app.getStreak().current;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('stat-livros', books.length);
  setText('stat-leituras', readings.length);
  setText('stat-autores', autores);
  setText('stat-metas', metas.length);
  setText('stat-streak', '🔥 '+streak);

  // Extras
  const tempoH = (readings.length * 1.2).toFixed(1); // estimativa
  setText('stat-tempo', tempoH+'h');
  const temas = books.flatMap(b=> b.temas || []);
  const top = temas.sort().reduce((acc,t)=> (acc[t]=(acc[t]||0)+1, acc), {});
  const gen = Object.entries(top).sort((a,b)=> b[1]-a[1])[0]?.[0] || '-';
  setText('stat-genero', gen);

  const goFeed = document.getElementById('go-feed');
  if (goFeed) goFeed.addEventListener('click', ()=> app.navTo('comunidade'));
  const feed = document.getElementById('feed');
  if (feed){
    const items = readings.slice(-5).map(r=> `<li>${r.titulo} — fim ${r.fim}</li>`).join('');
    feed.innerHTML = items || '<li>Sem atividades recentes.</li>';
  }
}
