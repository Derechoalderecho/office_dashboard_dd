import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "@/config/api";

// Constantes para configuración
const DEFAULT_TIMEOUT = 10000; // 10 segundos
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 segundo

// Configuración por defecto para las solicitudes
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interfaz para opciones de retry
interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

/**
 * Realiza una solicitud HTTP con manejo de errores y retry automático
 */
export async function apiRequest<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  const { 
    maxRetries = MAX_RETRIES, 
    retryDelay = RETRY_DELAY,
    retryCondition = defaultRetryCondition,
    ...axiosConfig 
  } = config || {};
  
  let retries = 0;
  let lastError: AxiosError | Error | null = null;
  
  // Agregar el prefijo si no existe
  const fullUrl = url.startsWith('http') ? url : url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url}`;
  
  while (retries <= maxRetries) {
    try {
      let response: AxiosResponse;
      
      switch (method) {
        case 'get':
          response = await axiosInstance.get(fullUrl, axiosConfig);
          break;
        case 'post':
          response = await axiosInstance.post(fullUrl, data, axiosConfig);
          break;
        case 'put':
          response = await axiosInstance.put(fullUrl, data, axiosConfig);
          break;
        case 'delete':
          response = await axiosInstance.delete(fullUrl, axiosConfig);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }
      
      return response.data as T;
      
    } catch (error) {
      lastError = error as AxiosError | Error;
      
      // Verificar si debemos intentar de nuevo
      if (
        retries < maxRetries && 
        error instanceof AxiosError && 
        retryCondition(error)
      ) {
        retries++;
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Aumentar el tiempo de espera para cada reintento
        axiosConfig.timeout = (axiosConfig.timeout || DEFAULT_TIMEOUT) * 1.5;
        
        console.warn(`Reintentando solicitud (${retries}/${maxRetries}): ${fullUrl}`);
      } else {
        break;
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  handleApiError(lastError);
  
  // Esto nunca debería ejecutarse porque handleApiError lanza una excepción
  throw lastError;
}

/**
 * Determina si una solicitud debe reintentarse basado en el tipo de error
 */
function defaultRetryCondition(error: AxiosError): boolean {
  // Reintentar en caso de errores de red o ciertos códigos HTTP
  return (
    !error.response || // Error de red
    error.code === 'ECONNABORTED' || // Timeout
    [408, 429, 500, 502, 503, 504].includes(error.response?.status || 0) // Ciertos errores HTTP
  );
}

/**
 * Maneja errores de API y los formatea para mejor diagnóstico
 */
export function handleApiError(error: AxiosError | Error | null): never {
  if (!error) {
    throw new Error("Se produjo un error desconocido");
  }
  
  if (axios.isAxiosError(error)) {
    // Error de Axios - formatear mejor el mensaje
    let message = "Error en la solicitud";
    let details = "";
    
    if (error.response) {
      // El servidor respondió con un código de error
      message = `Error ${error.response.status}: ${error.response.statusText}`;
      details = JSON.stringify(error.response.data, null, 2);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      message = "No se recibió respuesta del servidor";
      details = error.code === 'ECONNABORTED' 
        ? "La solicitud excedió el tiempo máximo de espera" 
        : error.message;
    } else {
      // Error al configurar la solicitud
      message = "Error al configurar la solicitud";
      details = error.message;
    }
    
    console.error(`${message}\n${details}`);
    
    // Crear un nuevo error con más información
    const enhancedError = new Error(message);
    enhancedError.name = "ApiError";
    (enhancedError as any).originalError = error;
    (enhancedError as any).details = details;
    
    throw enhancedError;
  }
  
  // Error genérico
  console.error(`Error: ${error.message}`);
  throw error;
}

/**
 * Realiza múltiples solicitudes en paralelo y controla los errores
 */
export async function batchRequests<T>(
  requests: Promise<any>[],
  allOrNothing: boolean = false
): Promise<T[]> {
  if (allOrNothing) {
    // Si se requieren todas las solicitudes exitosas
    return Promise.all(requests) as Promise<T[]>;
  } else {
    // Procesar todas las que se puedan, ignorando errores individuales
    const results = await Promise.allSettled(requests);
    
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<T> => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Loguear los errores pero no detener el proceso
    results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .forEach((result, index) => {
        console.error(`La solicitud ${index} falló:`, result.reason);
      });
    
    return successfulResults;
  }
}

// Funciones de conveniencia para cada método HTTP
export function get<T>(url: string, config?: AxiosRequestConfig & RetryConfig): Promise<T> {
  return apiRequest<T>('get', url, undefined, config);
}

export function post<T>(url: string, data?: any, config?: AxiosRequestConfig & RetryConfig): Promise<T> {
  return apiRequest<T>('post', url, data, config);
}

export function put<T>(url: string, data?: any, config?: AxiosRequestConfig & RetryConfig): Promise<T> {
  return apiRequest<T>('put', url, data, config);
}

export function del<T>(url: string, config?: AxiosRequestConfig & RetryConfig): Promise<T> {
  return apiRequest<T>('delete', url, undefined, config);
} 