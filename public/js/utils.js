import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  updateProfile as fbUpdateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Utils & storage
export function computeDays(paginas, porDia){
  const p = Math.max(0, Number(paginas)||0);
  const d = Math.max(1, Number(porDia)||0);
  return Math.max(1, Math.ceil(p/d));
}
export function computePagesPerDay(paginas, dias){
  const p = Math.max(0, Number(paginas)||0);
  const d = Math.max(1, Number(dias)||0);
  return p === 0 ? 0 : Math.max(1, Math.ceil(p/d));
}
// Simple wrapper around localStorage with JSON handling.
// Exported explicitly at the end of the file to avoid tree-shaking
// issues that could cause the module loader to think the export is
// missing (which led to "does not provide an export named 'store'").
const store = {
  get(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : structuredClone(fallback);
    }catch{
      return structuredClone(fallback);
    }
  },
  set(key, val){
    localStorage.setItem(key, JSON.stringify(val));
  }
};

export { store };
export function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
export function formatDate(d){ try{ return new Date(d).toISOString().slice(0,10); }catch{ return d; } }

// Streak helpers
const streakStatus = ['Medalha de Bronze', 'Medalha de Prata', 'Medalha de Ouro', 'Imortal'];
const statusMilestones = [7, 30, 90, 365];

const firestore = {
  get: async (db, uid, collectionName) => {
    const colRef = collection(db, "users", uid, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
  },
  add: async (db, uid, collectionName, data) => {
    const colRef = collection(db, "users", uid, collectionName);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  },
  update: async (db, uid, collectionName, id, data) => {
    const docRef = doc(db, "users", uid, collectionName, id);
    await updateDoc(docRef, data);
  },
  getOne: async (db, uid, collectionName, id) => {
    const docRef = doc(db, "users", uid, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  },
  // Nova função para excluir documentos
  delete: async (db, uid, collectionName, id) => {
    const docRef = doc(db, "users", uid, collectionName, id);
    await deleteDoc(docRef);
  },
  // Nova função para buscar documentos por query
  query: async (db, collectionName, q) => {
    const colRef = collection(db, collectionName);
    const qSnap = await getDocs(query(colRef, ...q));
    return qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// Backwards compatibility helpers
firestore.getAll = firestore.get;
firestore.set = async (db, uid, collectionName, id, data) => {
  const docRef = doc(db, "users", uid, collectionName, id);
  await setDoc(docRef, data);
};

const auth = {
  checkAuthState: (app, callback) => {
    onAuthStateChanged(app.auth, (user) => {
      if (user) {
        app.uid = user.uid;
        app.uname = user.displayName;
        app.uphoto = user.photoURL;
      } else {
        app.uid = null;
        app.uname = null;
        app.uphoto = null;
      }
      callback(user);
    });
  },
  signIn: (app) => {
    signInWithPopup(app.auth, new GoogleAuthProvider());
  },
  signOut: (app) => {
    signOut(app.auth);
  },
  // Nova função para excluir a conta do usuário
  deleteAccount: async (app) => {
    await deleteUser(app.auth.currentUser);
  },
  // Nova função para atualizar o perfil do usuário
  updateProfile: async (app, newProfile) => {
    await fbUpdateProfile(app.auth.currentUser, newProfile);
  }
};

export {
  firestore,
  auth,
  streakStatus,
  statusMilestones
}; // uid is exported above
