// Centralized cache system for services
// Allows reusing data between different requests and reducing API calls

export type CacheData<T> = {
  data: Map<string | number, T>;
  lastUpdated: number;
  bulkData?: T[] | null;
  bulkLastUpdated?: number;
};

const globalCache: Map<string, CacheData<any>> = new Map();

const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Get a value from the cache by key
 * @param cacheName
 * @param key
 * @param ttl
 * @returns
 */
export function getCachedItem<T>(
  cacheName: string,
  key: string | number,
  ttl: number = DEFAULT_TTL
): T | undefined {
  const cache = globalCache.get(cacheName);
  
  if (!cache) return undefined;
  
  if (Date.now() - cache.lastUpdated > ttl) {
    return undefined;
  }
  
  return cache.data.get(key) as T | undefined;
}

/**
 * Store a value in the cache
 * @param cacheName
 * @param key
 * @param value
 */
export function setCachedItem<T>(
  cacheName: string,
  key: string | number,
  value: T
): void {
  if (!globalCache.has(cacheName)) {
    globalCache.set(cacheName, {
      data: new Map(),
      lastUpdated: Date.now()
    });
  }
  
  const cache = globalCache.get(cacheName)!;
  cache.data.set(key, value);
  cache.lastUpdated = Date.now();
}

/**
 * Get the entire collection of data from a cache
 * @param cacheName
 * @param ttl
 * @returns
 */
export function getCachedCollection<T>(
  cacheName: string,
  ttl: number = DEFAULT_TTL
): T[] | undefined {
  const cache = globalCache.get(cacheName);
  
  if (!cache || !cache.bulkData) return undefined;
  
  if (!cache.bulkLastUpdated || Date.now() - cache.bulkLastUpdated > ttl) {
    return undefined;
  }
  
  return cache.bulkData as T[];
}

/**
 * Store a complete collection in the cache
 * @param cacheName
 * @param items
 * @param keyExtractor
 */
export function setCachedCollection<T>(
  cacheName: string,
  items: T[],
  keyExtractor: (item: T) => string | number
): void {
  if (!globalCache.has(cacheName)) {
    globalCache.set(cacheName, {
      data: new Map(),
      lastUpdated: Date.now(),
      bulkData: items,
      bulkLastUpdated: Date.now()
    });
  } else {
    const cache = globalCache.get(cacheName)!;
    
    cache.bulkData = items;
    cache.bulkLastUpdated = Date.now();
    
    items.forEach(item => {
      const key = keyExtractor(item);
      cache.data.set(key, item);
    });
  }
}

/**
 * Invalidate a specific element of a cache
 * @param cacheName
 * @param key
 */
export function invalidateCacheItem(
  cacheName: string,
  key: string | number
): void {
  const cache = globalCache.get(cacheName);
  if (cache) {
    const data = cache.data.get(key);
    if (data) {
      cache.data.delete(key);
      console.log(`Caché invalidada: ${cacheName}[${key}]`);
    }
  }
}

/**
 * Invalidate a cache completely
 * @param cacheName
 */
export function invalidateCache(cacheName: string): void {
  if (globalCache.has(cacheName)) {
    globalCache.delete(cacheName);
    console.log(`Caché completa invalidada: ${cacheName}`);
  }
}

/**
 * Invalidate all caches
 */
export function invalidateAllCaches(): void {
  globalCache.clear();
}

/**
 * Helper function to implement cache pattern in services
 * @param cacheName
 * @param key
 * @param fetchFn
 * @param ttl
 */
export async function getWithCache<T>(
  cacheName: string,
  key: string | number,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedItem = getCachedItem<T>(cacheName, key, ttl);
  
  if (cachedItem !== undefined) {
    return cachedItem;
  }
  
  const item = await fetchFn();
  setCachedItem(cacheName, key, item);
  return item;
}

/**
 * Helper function to implement cache pattern in collections
 * @param cacheName
 * @param fetchFn
 * @param keyExtractor
 * @param ttl
 */
export async function getCollectionWithCache<T>(
  cacheName: string,
  fetchFn: () => Promise<T[]>,
  keyExtractor: (item: T) => string | number,
  ttl?: number
): Promise<T[]> {
  const cachedCollection = getCachedCollection<T>(cacheName, ttl);
  
  if (cachedCollection !== undefined) {
    return cachedCollection;
  }
  
  const items = await fetchFn();
  setCachedCollection(cacheName, items, keyExtractor);
  return items;
} 