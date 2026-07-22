import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.config";

const CACHE_NAME = "exercise-images-v1";

// In-memory cache: avoids re-touching Cache Storage / re-creating object
// URLs for images already resolved during this session.
const memoryCache = new Map<string, string>();

function cacheKey(filename: string) {
  // A stable synthetic URL -- NOT the real (token-bearing) Firebase
  // download URL, so it stays valid as a cache key indefinitely.
  return `https://exercise-image-cache.local/${filename}`;
}

async function getFromCacheStorage(key: string): Promise<Blob | null> {
  if (!("caches" in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(key);
    return match ? await match.blob() : null;
  } catch (e) {
    console.warn("Cache Storage read failed", e);
    return null;
  }
}

async function saveToCacheStorage(key: string, blob: Blob) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      key,
      new Response(blob, {
        headers: { "Content-Type": blob.type || "image/webp" },
      }),
    );
  } catch (e) {
    console.warn("Cache Storage write failed", e);
  }
}

/**
 * Resolves a displayable object URL for an exercise image, checking
 * (in order): in-memory cache -> persistent Cache Storage -> Firebase.
 * Only hits Firebase (getDownloadURL + actual image fetch) on a cache miss.
 */
export async function loadCachedImage(
  filename: string,
  signal: AbortSignal,
): Promise<string> {
  const key = cacheKey(filename);

  const mem = memoryCache.get(key);
  if (mem) return mem;

  const cachedBlob = await getFromCacheStorage(key);
  if (cachedBlob) {
    const objectUrl = URL.createObjectURL(cachedBlob);
    memoryCache.set(key, objectUrl);
    return objectUrl;
  }

  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  const fileRef = storageRef(storage, filename);
  const downloadUrl = await getDownloadURL(fileRef);

  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  const response = await fetch(downloadUrl, { signal });
  const blob = await response.blob();

  await saveToCacheStorage(key, blob);

  const objectUrl = URL.createObjectURL(blob);
  memoryCache.set(key, objectUrl);
  return objectUrl;
}

export async function clearImageCache() {
  memoryCache.forEach((url) => URL.revokeObjectURL(url));
  memoryCache.clear();
  if ("caches" in window) {
    await caches.delete(CACHE_NAME);
  }
}
