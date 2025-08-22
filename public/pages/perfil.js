
export function initPage(app){
  const btn = document.getElementById('btn-save');
  btn.addEventListener('click', ()=> app.toast('Perfil salvo (demo)'));
}
