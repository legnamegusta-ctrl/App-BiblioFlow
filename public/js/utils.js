import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
    await updateProfile(app.auth.currentUser, newProfile);
  }
};

const uid = () => {
  let a = new Uint32Array(3);
  window.crypto.getRandomValues(a);
  return (
    performance.now().toString(36) +
    Array.from(a)
    .map((d) => d.toString(36))
    .join("")
  ).replace(/\./g, "");
};

export {
  firestore,
  auth,
  uid
};