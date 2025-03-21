// Sistema centralizado de caché para servicios
// Permite reutilizar datos entre diferentes solicitudes y reducir llamadas a la API

// Tipo genérico para las caches
export type CacheData<T> = {
  data: Map<string | number, T>;
  lastUpdated: number;
  bulkData?: T[] | null;
  bulkLastUpdated?: number;
};

// Cache global que puede ser compartida entre servicios
const globalCache: Map<string, CacheData<any>> = new Map();

// TTL por defecto: 5 minutos en milisegundos
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Obtiene un valor de la caché por clave
 * @param cacheName Nombre de la caché (ej: 'users', 'cases')
 * @param key Clave del elemento
 * @param ttl Tiempo de vida en ms (por defecto 5 minutos)
 * @returns El valor almacenado o undefined si no existe o expiró
 */
export function getCachedItem<T>(
  cacheName: string,
  key: string | number,
  ttl: number = DEFAULT_TTL
): T | undefined {
  const cache = globalCache.get(cacheName);
  
  if (!cache) return undefined;
  
  // Verificar si la caché completa ha expirado
  if (Date.now() - cache.lastUpdated > ttl) {
    return undefined;
  }
  
  return cache.data.get(key) as T | undefined;
}

/**
 * Almacena un valor en la caché
 * @param cacheName Nombre de la caché
 * @param key Clave del elemento
 * @param value Valor a almacenar
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
 * Obtiene toda la colección de datos de una caché
 * @param cacheName Nombre de la caché
 * @param ttl Tiempo de vida en ms
 * @returns Array con todos los valores o undefined si expiró
 */
export function getCachedCollection<T>(
  cacheName: string,
  ttl: number = DEFAULT_TTL
): T[] | undefined {
  const cache = globalCache.get(cacheName);
  
  if (!cache || !cache.bulkData) return undefined;
  
  // Verificar si la caché de colección ha expirado
  if (!cache.bulkLastUpdated || Date.now() - cache.bulkLastUpdated > ttl) {
    return undefined;
  }
  
  return cache.bulkData as T[];
}

/**
 * Almacena una colección completa en la caché
 * @param cacheName Nombre de la caché
 * @param items Array de elementos
 * @param keyExtractor Función para extraer la clave de cada elemento
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
    
    // Actualizar la colección
    cache.bulkData = items;
    cache.bulkLastUpdated = Date.now();
    
    // También actualizar el mapa de elementos individuales
    items.forEach(item => {
      const key = keyExtractor(item);
      cache.data.set(key, item);
    });
  }
}

/**
 * Invalida un elemento específico en la caché
 */
export function invalidateCacheItem(
  cacheName: string,
  key: string | number
): void {
  const cache = globalCache.get(cacheName);
  if (cache) {
    cache.data.delete(key);
  }
}

/**
 * Invalida toda una caché por nombre
 */
export function invalidateCache(cacheName: string): void {
  globalCache.delete(cacheName);
}

/**
 * Invalida todas las cachés
 */
export function invalidateAllCaches(): void {
  globalCache.clear();
}

/**
 * Función helper para implementar patrón de caché en servicios
 * @param cacheName Nombre de la caché
 * @param key Clave del elemento
 * @param fetchFn Función para obtener los datos si no están en caché
 * @param ttl Tiempo de vida (opcional)
 */
export async function getWithCache<T>(
  cacheName: string,
  key: string | number,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Intentar obtener de caché
  const cachedItem = getCachedItem<T>(cacheName, key, ttl);
  
  if (cachedItem !== undefined) {
    return cachedItem;
  }
  
  // Si no está en caché, obtener y guardar
  const item = await fetchFn();
  setCachedItem(cacheName, key, item);
  return item;
}

/**
 * Función helper para implementar patrón de caché en colecciones
 * @param cacheName Nombre de la caché
 * @param fetchFn Función para obtener los datos si no están en caché
 * @param keyExtractor Función para extraer la clave de cada elemento
 * @param ttl Tiempo de vida (opcional)
 */
export async function getCollectionWithCache<T>(
  cacheName: string,
  fetchFn: () => Promise<T[]>,
  keyExtractor: (item: T) => string | number,
  ttl?: number
): Promise<T[]> {
  // Intentar obtener de caché
  const cachedCollection = getCachedCollection<T>(cacheName, ttl);
  
  if (cachedCollection !== undefined) {
    return cachedCollection;
  }
  
  // Si no está en caché, obtener y guardar
  const items = await fetchFn();
  setCachedCollection(cacheName, items, keyExtractor);
  return items;
} 