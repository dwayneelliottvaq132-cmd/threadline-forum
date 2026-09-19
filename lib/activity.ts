const databaseName = 'threadline-activity';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('activity');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Storage blocked'));
  });
}
export async function readActivity<T>(): Promise<T | null> {
  const db = await openDatabase();
  try {
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction('activity', 'readonly');
      const request = tx.objectStore('activity').get('current');
      tx.oncomplete = () => {
        if (request.result) { resolve(request.result as T); return; }
        // Import existing device activity on first use; old messages belong to c1.
        try {
          const previous = JSON.parse(localStorage.getItem('threadline-state') || 'null');
          resolve(previous ? { ...previous, threads: { c1: previous.messages ?? [], c2: [], c3: [] } } : null);
        } catch { resolve(null); }
      };
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function writeActivity(state: unknown): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('activity', 'readwrite');
      tx.objectStore('activity').put(state, 'current');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
