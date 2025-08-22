
export function initPage(app){
  const grid = document.getElementById('grid');
  const t = document.getElementById('streak-text');
  const badgeBox = document.getElementById('badges');
  const btn = document.getElementById('btn-registrar');
  function render(){
    const s = app.getStreak();
    t.textContent = `🔥 ${s.current} dias`;
    grid.innerHTML = s.history.map(ok=> `<div style="width:22px;height:22px;border-radius:8px;border:1px solid ${ok?'rgba(239,128,34,.4)':'rgba(255,255,255,.1)'}; background:${ok?'rgba(239,128,34,.2)':'rgba(255,255,255,.06)'}"></div>`).join('');
    const b=[];
    if(s.current>=7) b.push('🏅 Bronze 7d');
    if(s.current>=30) b.push('🥈 Prata 30d');
    if(s.current>=100) b.push('🥇 Ouro 100d');
    badgeBox.innerHTML = b.map(x=> `<span class="chip">${x}</span>`).join('');
  }
  btn.addEventListener('click', ()=>{
    const s = app.getStreak();
    s.current += 1;
    s.history.unshift(true); s.history = s.history.slice(0,21);
    app.setStreak(s); render(); app.toast('Leitura diária registrada');
  });
  render();
}
