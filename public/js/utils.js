// Utils & storage
export function computeDays(paginas, porDia){
  const p = Math.max(0, Number(paginas)||0);
  const d = Math.max(1, Number(porDia)||0);
  return Math.max(1, Math.ceil(p/d));
}
export function computePagesPerDay(paginas, dias){
  const p = Math.max(0, Number(paginas)||0);
  const d = Math.max(1, Number(dias)||1);
  return Math.max(1, Math.ceil(p/d));
}
export const store = {
  get(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : structuredClone(fallback);
    }catch{ return structuredClone(fallback); }
  },
  set(key, val){
    localStorage.setItem(key, JSON.stringify(val));
  }
};
export function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
export function formatDate(d){ try{ return new Date(d).toISOString().slice(0,10); }catch{ return d; } }

// Firebase Functions
export const firestore = {
  async getAll(db, uid, collectionName){
    const q = query(collection(db, 'users', uid, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async set(db, uid, collectionName, id, data){
    await setDoc(doc(db, 'users', uid, collectionName, id), data);
  },
  async add(db, uid, collectionName, data){
    const newDoc = doc(collection(db, 'users', uid, collectionName));
    await setDoc(newDoc, data);
    return newDoc.id;
  },
  async del(db, uid, collectionName, id){
    await deleteDoc(doc(db, 'users', uid, collectionName, id));
  }
};