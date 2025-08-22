
export async function initPage(app){
  const books = await app.getBooks();
  const readings = await app.getReadings();
  const metas = await app.getMetas();
  const autores = new Set(books.map(b=>b.autor)).size;
  const streak = app.getStreak().current;
  document.getElementById('stat-livros').textContent = books.length;
  document.getElementById('stat-leituras').textContent = readings.length;
  document.getElementById('stat-autores').textContent = autores;
  document.getElementById('stat-metas').textContent = metas.length;
  document.getElementById('stat-streak').textContent = '🔥 '+streak;

  // Extras
  const tempoH = (readings.length * 1.2).toFixed(1); // estimativa
  document.getElementById('stat-tempo').textContent = tempoH+'h';
  const temas = books.flatMap(b=> b.temas || []);
  const top = temas.sort().reduce((acc,t)=> (acc[t]=(acc[t]||0)+1, acc), {});
  const gen = Object.entries(top).sort((a,b)=> b[1]-a[1])[0]?.[0] || '-';
  document.getElementById('stat-genero').textContent = gen;

  document.getElementById('go-feed').addEventListener('click', ()=> app.navTo('comunidade'));
  const feed = document.getElementById('feed');
  const items = readings.slice(-5).map(r=> `<li>${r.titulo} — fim ${r.fim}</li>`).join('');
  feed.innerHTML = items || '<li>Sem atividades recentes.</li>';
}
