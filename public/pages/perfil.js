import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function initPage(app){
  const auth = getAuth();
  const user = auth.currentUser;

  document.getElementById('uid').value = user.uid;
  document.getElementById('current-email').value = user.email;

  const btnSave = document.getElementById('btn-save-perfil');
  btnSave.addEventListener('click', ()=> app.toast('Perfil salvo (demo)'));

  const btnUpdateEmail = document.getElementById('btn-update-email');
  btnUpdateEmail.addEventListener('click', async ()=>{
    const newEmail = document.getElementById('new-email').value;
    const currentPassword = document.getElementById('current-password').value;
    if(!newEmail || !currentPassword){
      app.toast('Preencha os campos de email e senha.');
      return;
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try{
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      app.toast('Email atualizado!');
    }catch(error){
      console.error(error);
      app.toast('Erro ao atualizar email.');
    }
  });

  const btnUpdatePassword = document.getElementById('btn-update-password');
  btnUpdatePassword.addEventListener('click', async ()=>{
    const oldPassword = document.getElementById('old-password-change').value;
    const newPassword = document.getElementById('new-password-change').value;
    if(!oldPassword || !newPassword){
      app.toast('Preencha os campos de senha.');
      return;
    }
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    try{
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      app.toast('Senha atualizada!');
    }catch(error){
      console.error(error);
      app.toast('Erro ao atualizar senha.');
    }
  });
}