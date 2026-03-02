// services/imageStore.ts
// IndexedDB 图片存储服务 — 生成图片存入 IndexedDB，避免 localStorage 配额溢出

const DB_NAME = 'nanoBananaImages';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export const IMGREF_PREFIX = 'imgref:';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** 存储图片到 IndexedDB，返回引用 ID（格式：imgref:<id>） */
export async function saveImage(dataUri: string): Promise<string> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const refId = `${IMGREF_PREFIX}${id}`;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUri, id);
    tx.oncomplete = () => resolve(refId);
    tx.onerror = () => reject(tx.error);
  });
}

/** 从 IndexedDB 加载图片 */
export async function loadImage(ref: string): Promise<string | null> {
  if (!ref.startsWith(IMGREF_PREFIX)) return ref;
  const id = ref.slice(IMGREF_PREFIX.length);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

/** 批量加载图片 */
export async function loadImages(refs: string[]): Promise<(string | null)[]> {
  if (refs.length === 0) return [];

  const results: (string | null)[] = new Array(refs.length);
  const dbReads: { index: number; id: string }[] = [];

  refs.forEach((ref, i) => {
    if (!ref.startsWith(IMGREF_PREFIX)) {
      results[i] = ref;
    } else {
      dbReads.push({ index: i, id: ref.slice(IMGREF_PREFIX.length) });
    }
  });

  if (dbReads.length === 0) return results;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    dbReads.forEach(({ index, id }) => {
      const request = store.get(id);
      request.onsuccess = () => { results[index] = request.result ?? null; };
    });

    tx.oncomplete = () => resolve(results);
    tx.onerror = () => reject(tx.error);
  });
}

/** 删除指定图片 */
export async function deleteImage(ref: string): Promise<void> {
  if (!ref.startsWith(IMGREF_PREFIX)) return;
  const id = ref.slice(IMGREF_PREFIX.length);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 判断是否为 IndexedDB 图片引用 */
export function isImageRef(s: string): boolean {
  return s.startsWith(IMGREF_PREFIX);
}
