/* Stockage local du navigateur (IndexedDB), partagé par le studio et le catalogue.
   Il garde le visuel en cours de chaque produit et le visuel à joindre au prochain devis.
   Rien ne quitte l'appareil du client tant que la demande de devis n'est pas envoyée.
   Sans IndexedDB (navigation privée stricte), tout continue de fonctionner, sans mémoire d'une page à l'autre. */
window.IFSStore = (() => {
  "use strict";
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    if (!window.indexedDB) { rej(new Error("indexedDB absent")); return; }
    const r = indexedDB.open("ifs-studio", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => {
    try {
      const db = await open();
      return await new Promise((res, rej) => {
        const t = db.transaction("kv", mode), st = t.objectStore("kv"), q = fn(st);
        t.oncomplete = () => res(q && q.result);
        t.onerror = t.onabort = () => rej(t.error);
      });
    } catch (err) { return undefined; }
  };
  return {
    get: key => tx("readonly", st => st.get(key)),
    set: (key, value) => tx("readwrite", st => st.put(value, key)),
    del: key => tx("readwrite", st => st.delete(key))
  };
})();
