// Utils & storage
import { collection, query, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

// Firebase Functions
export const firestore = {
  async getAll(db, uid, collectionName){
    if(!uid) return [];
    const q = query(collection(db, 'users', uid, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async set(db, uid, collectionName, id, data){
    if(!uid) return;
    await setDoc(doc(db, 'users', uid, collectionName, id), data);
  },
  async add(db, uid, collectionName, data){
    if(!uid) return null;
    const newDoc = doc(collection(db, 'users', uid, collectionName));
    await setDoc(newDoc, data);
    return newDoc.id;
  },
  async del(db, uid, collectionName, id){
    if(!uid) return;
    await deleteDoc(doc(db, 'users', uid, collectionName, id));
  }
};

