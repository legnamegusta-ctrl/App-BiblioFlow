import { firestore, auth, uid } from '../js/utils.js';
import { where, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function initPage(app){
  const btnSalvar = document.getElementById('btn-salvar-perfil');
  const btnGerarCodigo = document.getElementById('btn-gerar-codigo');
  const btnVincularCodigo = document.getElementById('btn-vincular-codigo');
  const btnImportar = document.getElementById('btn-importar');
  const btnExcluirConta = document.getElementById('btn-excluir-conta');

  // Funcionalidade de Excluir Conta
  if (btnExcluirConta) btnExcluirConta.addEventListener('click', () => {
    app.openModal('Excluir Conta', `
      <div class="field">
        <label class="label">Confirme sua senha para continuar</label>
        <input type="password" id="f-senha" class="input" required>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top: 12px">
        <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-back').remove()">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-confirmar-exclusao">Confirmar</button>
      </div>
    `).then(modal => {
      const btnConfirmar = modal.querySelector('#btn-confirmar-exclusao');
      btnConfirmar.addEventListener('click', async () => {
        // A lógica de confirmação de senha é complexa e precisa ser feita no back-end para segurança.
        // Como o foco é o front-end, vamos simular a exclusão direta após a confirmação do usuário.
        // Em um aplicativo real, você usaria Firebase Auth para reautenticar o usuário.
        try {
          await auth.deleteAccount(app);
          modal.close();
          app.toast('Conta excluída com sucesso.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } catch (e) {
          app.toast(`Erro ao excluir a conta: ${e.message}`);
        }
      });
    });
  });

  // Funcionalidade de Gerar Código de Acervo
  if (btnGerarCodigo) btnGerarCodigo.addEventListener('click', async () => {
    const myLibrary = await firestore.get(app.db, app.uid, 'library');
    if(myLibrary.length === 0){
        app.toast('Seu acervo está vazio!');
        return;
    }
    const shareCode = uid();
    await firestore.add(app.db, null, 'sharedLibraries', {
      ownerId: app.uid,
      code: shareCode,
      createdAt: new Date().toISOString(),
      library: myLibrary.map(book => ({
        id: book.id,
        ...book
      }))
    });
    app.openModal('Código de Acervo', `
      <p>Compartilhe este código para que seus amigos possam ver seu acervo:</p>
      <div class="field" style="margin-top:12px">
        <input class="input" value="${shareCode}" readonly>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:12px">
        <button type="button" class="btn btn-primary" onclick="navigator.clipboard.writeText('${shareCode}'); app.toast('Código copiado!')">Copiar</button>
      </div>
    `);
  });

  // Funcionalidade de Vincular Código
  if (btnVincularCodigo) btnVincularCodigo.addEventListener('click', () => {
    app.openModal('Vincular Acervo', `
      <form id="frm-vincular-codigo">
        <div class="field">
          <label class="label">Digite o código de acervo</label>
          <input id="f-codigo-acervo" class="input" required>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:12px">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-back').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Vincular</button>
        </div>
      </form>
    `).then(modal => {
      modal.querySelector('#frm-vincular-codigo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = modal.querySelector('#f-codigo-acervo').value;
        const result = await firestore.query(app.db, 'sharedLibraries', [where('code', '==', code), limit(1)]);

        if(result.length > 0){
          const sharedLibrary = result[0].library;
          for(const book of sharedLibrary){
            await firestore.add(app.db, app.uid, 'library', book);
          }
          modal.close();
          app.toast('Acervo vinculado com sucesso!');
        } else {
          app.toast('Código não encontrado ou inválido.');
        }
      });
    });
  });

  // Funcionalidade de Importar
  if (btnImportar) btnImportar.addEventListener('click', () => {
    app.openModal('Importar Dados', `
      <form id="frm-importar">
        <div class="field">
          <label class="label">Cole os dados do acervo aqui (formato JSON)</label>
          <textarea id="f-json-acervo" class="input" rows="8" required></textarea>
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:12px">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-back').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Importar</button>
        </div>
      </form>
    `).then(modal => {
      modal.querySelector('#frm-importar').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const jsonData = JSON.parse(modal.querySelector('#f-json-acervo').value);
          if(!Array.isArray(jsonData)){
            app.toast('O JSON deve ser uma lista de livros.');
            return;
          }
          for(const book of jsonData){
            await firestore.add(app.db, app.uid, 'library', book);
          }
          modal.close();
          app.toast('Dados importados com sucesso!');
        } catch (e) {
          app.toast('Erro ao importar. Verifique se o formato JSON está correto.');
        }
      });
    });
  });
}
