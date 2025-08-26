import { streakStatus, statusMilestones } from '../js/utils.js';
export function initPage(app){
  const grid = document.getElementById('grid');
  const t = document.getElementById('streak-text');
  const statusEl = document.getElementById('status-text');
  const btn = document.getElementById('btn-registrar');
  const mesAnoEl = document.getElementById('mes-ano');
  const btnPrev = document.getElementById('btn-prev-month');
  const btnNext = document.getElementById('btn-next-month');
  const medalhasGrid = document.getElementById('medalhas-grid');

  let mesAtual = new Date().getMonth();
  let anoAtual = new Date().getFullYear();

  function getStatusName(days){
    if (days < 3) return 'Iniciante';
    if (days >= 365) return 'Imortal';
    
    let index = statusMilestones.findLastIndex(milestone => days >= milestone);
    if (index === -1) index = 0; // Se não houver marco alcançado, retorna o primeiro

    return streakStatus[index];
  }

  function renderCalendar(mes, ano){
    const s = app.getStreak();
    const today = new Date();
    const isCurrentMonth = (mes === today.getMonth() && ano === today.getFullYear());
    
    mesAnoEl.textContent = new Date(ano, mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    grid.innerHTML = '';
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaDaSemana = primeiroDia.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    for(let i = 0; i < diaDaSemana; i++){
      const emptyElement = document.createElement('div');
      grid.appendChild(emptyElement);
    }

    for(let i = 1; i <= diasNoMes; i++){
      const dateStr = new Date(ano, mes, i).toISOString().slice(0,10);
      const isRegistered = s.dates.includes(dateStr);
      
      const dayElement = document.createElement('div');
      dayElement.className = 'dia-caixa';
      dayElement.style.background = isRegistered?'rgba(239,128,34,.2)':'rgba(255,255,255,.06)';
      dayElement.style.border = `1px solid ${isRegistered?'rgba(239,128,34,.4)':'rgba(255,255,255,.1)'}`;
      dayElement.innerHTML = `<div style="font-weight:600">${i}</div>`;
      grid.appendChild(dayElement);
    }
    
    btnNext.disabled = isCurrentMonth;
  }

  function renderMedalhas(days){
    medalhasGrid.innerHTML = '';
    streakStatus.forEach((name, index) => {
      const milestone = statusMilestones[index];
      const isAchieved = days >= milestone;
      
      const medalha = document.createElement('div');
      medalha.className = 'medalha-box';
      medalha.title = `${name} - ${milestone} dias`;
      
      const icon = document.createElement('div');
      icon.className = 'medalha-icone';
      icon.style.background = isAchieved ? getMedalColor(name) : 'var(--bf-muted)';
      
      const numero = document.createElement('div');
      numero.textContent = milestone;
      numero.style.color = 'white'; // Cor branca para o número
      numero.style.fontWeight = 'bold';
      icon.appendChild(numero);

      const nameEl = document.createElement('div');
      nameEl.className = 'medalha-nome';
      nameEl.textContent = name;
      nameEl.style.color = isAchieved ? 'var(--bf-ink)' : 'var(--bf-muted)';

      medalha.appendChild(icon);
      medalha.appendChild(nameEl);
      medalhasGrid.appendChild(medalha);
    });
  }
  
  function getMedalColor(name){
      if(name.includes('de Bronze')) return 'var(--bf-bronze)';
      if(name.includes('de Prata')) return 'var(--bf-prata)';
      if(name.includes('de Ouro')) return 'var(--bf-ouro)';
      if(name.includes('Imortal')) return 'var(--bf-imortal)';
      return 'var(--bf-muted)';
  }

  function render(){
    const s = app.getStreak();
    const todayStr = new Date().toISOString().slice(0,10);
    const canRegister = s.lastRegisteredDate !== todayStr;
    
    t.textContent = `🔥 ${s.current} dias`;
    statusEl.textContent = getStatusName(s.current);
    btn.disabled = !canRegister;
    btn.textContent = canRegister ? 'Registrar Leitura Diária' : 'Registro de hoje já feito!';

    renderCalendar(mesAtual, anoAtual);
    renderMedalhas(s.current);
  }

  btnPrev.addEventListener('click', ()=>{
    mesAtual--;
    if(mesAtual < 0){
      mesAtual = 11;
      anoAtual--;
    }
    render();
  });
  
  btnNext.addEventListener('click', ()=>{
    mesAtual++;
    if(mesAtual > 11){
      mesAtual = 0;
      anoAtual++;
    }
    render();
  });

  btn.addEventListener('click', ()=>{
    const s = app.getStreak();
    const today = new Date().toISOString().slice(0,10);

    if(s.lastRegisteredDate === today){
      app.toast('Você já registrou sua leitura hoje.');
      return;
    }

    s.current += 1;
    s.dates.unshift(today);
    s.lastRegisteredDate = today;
    app.setStreak(s);
    render();
    app.toast('Leitura diária registrada!');
  });
  
  const s = app.getStreak();
  if(!s.dates) {
    s.dates = [];
    app.setStreak(s);
  }

  render();
}