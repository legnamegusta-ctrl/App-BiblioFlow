export async function initPage(app){
  document.getElementById('btn-gerar').addEventListener('click', ()=> app.toast('Código do acervo: acv_'+Math.random().toString(36).slice(2,7)));
  document.getElementById('btn-vincular').addEventListener('click', ()=> app.toast('Vinculado (demo)'));
  document.getElementById('btn-import').addEventListener('click', ()=> app.toast('Importar (demo)'));
  document.getElementById('btn-export').addEventListener('click', async ()=> {
    const data = { books: await app.getBooks(), readings: await app.getReadings(), metas: await app.getMetas() };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'biblioflow-export.json'; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('btn-excluir').addEventListener('click', ()=> app.toast('Conta excluída (demo)'));

  const pwaCard = document.getElementById('card-pwa');
  const pwaInstallBtn = document.getElementById('btn-pwa-install');
  if(pwaInstallBtn){
    pwaInstallBtn.addEventListener('click', async ()=>{
      if(window.deferredPrompt){
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if(outcome === 'accepted'){
          app.toast('Instalação aceita!');
        }else{
          app.toast('Instalação cancelada!');
        }
        window.deferredPrompt = null;
        pwaCard.classList.add('hidden');
      }
    });
  }
}