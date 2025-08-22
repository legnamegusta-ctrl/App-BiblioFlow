import { store, firestore } from './utils.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const routes = ['dashboard','acervo','leituras','metas','calculadora','temporizador','comunidade','streaks','perfil','configuracoes'];
let db, uid;

export const BiblioFlow = {
  state: { toastTimer: null },
  data: {
    booksKey: 'bf_books',
    readingsKey: 'bf_readings',
    metasKey: 'bf_metas',
    streakKey: 'bf_streak',
    draftKey: 'bf_meta_draft'
  },
  toast(msg){
    const el = document.getElementById('toast');
    el.innerHTML = '<div>'+msg+'</div>';
    el.classList.remove('hidden');
    clearTimeout(this.state.toastTimer);
    this.state.toastTimer = setTimeout(()=> el.classList.add('hidden'), 1600);
  },
  navTo(hash){ location.hash = '#'+hash; },
  async getBooks(){ return await firestore.getAll(db, uid, 'books'); },
  async setBooks(v){ for(let book of v){ await firestore.set(db, uid, 'books', book.id, book); } },
  async getReadings(){ return await firestore.getAll(db, uid, 'readings'); },
  async setReadings(v){ for(let reading of v){ await firestore.set(db, uid, 'readings', reading.id, reading); } },
  async getMetas(){ return await firestore.getAll(db, uid, 'metas'); },
  async setMetas(v){ for(let meta of v){ await firestore.set(db, uid, 'metas', meta.id, meta); } },
  getStreak(){ return store.get(this.data.streakKey, {current:8, history: Array.from({length:21}, (_,i)=> i<8)} ); },
  setStreak(v){ store.set(this.data.streakKey, v); },
  setMetaDraft(obj){ store.set(this.data.draftKey, obj); },
  pullMetaDraft(){ const v = store.get(this.data.draftKey, null); localStorage.removeItem(this.data.draftKey); return v; },

  toggleTheme(){
    const cur = localStorage.getItem('bf_theme')||'dark';
    const next = cur==='dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', next==='light');
    localStorage.setItem('bf_theme', next);
    this.toast('Tema: '+(next==='light'?'claro':'escuro'));
  },

  openModal(title, contentEl){
    const back = document.createElement('div'); back.className = 'modal-back';
    const modal = document.createElement('div'); modal.className = 'modal fade-in';
    const head = document.createElement('div'); head.className = 'modal-head';
    head.innerHTML = '<div style="font-weight:600">'+title+'</div>';
    const close = document.createElement('button'); close.className='iconbtn'; close.innerHTML='✕'; close.onclick = ()=> document.body.removeChild(back);
    head.appendChild(close);
    const body = document.createElement('div'); body.className = 'modal-body';
    body.appendChild(contentEl);
    modal.appendChild(head); modal.appendChild(body);
    back.appendChild(modal);
    back.addEventListener('click', (e)=>{ if(e.target===back) document.body.removeChild(back); });
    document.body.appendChild(back);
    return { close: ()=> document.body.contains(back) && document.body.removeChild(back) };
  },
  
  async init(firebaseDb, firebaseUid){
    db = firebaseDb;
    uid = firebaseUid;
    this.db = db;
    this.uid = uid;
    await loadRoute();
    updateNavBadges();
  }
};

// Router
async function loadRoute(){
  const hash = location.hash.replace('#','') || 'dashboard';
  if(!routes.includes(hash)) { location.hash = '#dashboard'; return; }

  document.querySelectorAll('.navbtn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.route === hash);
  });

  const page = document.getElementById('page');
  const htmlResp = await fetch(`./pages/${hash}.html`);
  const html = await htmlResp.text();
  page.innerHTML = html;

  const mod = await import(`../pages/${hash}.js?ts=${Date.now()}`);
  if (typeof mod.initPage === 'function'){
    mod.initPage(BiblioFlow);
  }
}

async function updateNavBadges(){
  const metas = await BiblioFlow.getMetas();
  const overdue = metas.filter(m=> m.tipo==='prazo' && m.prazo && new Date(m.prazo) < new Date() && !m.concluida).length;
  document.querySelectorAll('.navbtn').forEach(btn=>{
    const label = btn.querySelector('.badge');
    if(btn.dataset.route==='metas'){
      label.textContent = 'Metas' + (overdue? ` (${overdue})` : '');
      if(overdue) btn.classList.add('warn'); else btn.classList.remove('warn');
    }
  });
}

window.addEventListener('hashchange', ()=>{ loadRoute(); updateNavBadges(); });
window.addEventListener('DOMContentLoaded', ()=>{
  document.body.classList.toggle('light', (localStorage.getItem('bf_theme')||'dark')==='light');
  document.getElementById('brand').addEventListener('click', ()=> BiblioFlow.navTo('dashboard'));
  document.getElementById('btn-timer').addEventListener('click', ()=> BiblioFlow.navTo('temporizador'));
  document.getElementById('btn-streaks').addEventListener('click', ()=> BiblioFlow.navTo('streaks'));
  const menuBtn = document.getElementById('btn-menu');
  const panel = document.getElementById('menu-panel');
  menuBtn.addEventListener('click', (e)=>{ e.stopPropagation(); panel.classList.toggle('hidden'); });
  document.addEventListener('click', ()=> panel.classList.add('hidden'));
  document.getElementById('menu-perfil').addEventListener('click', ()=> BiblioFlow.navTo('perfil'));
  document.getElementById('menu-config').addEventListener('click', ()=> BiblioFlow.navTo('configuracoes'));
  document.getElementById('menu-tema').addEventListener('click', ()=> BiblioFlow.toggleTheme());
  document.getElementById('menu-sair').addEventListener('click', ()=> {
    signOut(getAuth()).then(() => BiblioFlow.toast('Desconectado'));
  });
  document.querySelectorAll('.navbtn').forEach(btn=> btn.addEventListener('click', ()=> BiblioFlow.navTo(btn.dataset.route)));

  loadRoute(); updateNavBadges();
});

if ('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}