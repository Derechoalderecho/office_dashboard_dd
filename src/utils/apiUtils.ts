import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "@/config/api";
import { store } from "@/store/store";

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const secureBaseURL =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  API_BASE_URL
    ? API_BASE_URL.replace("http:", "https:")
    : API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: secureBaseURL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token de autenticación a todas las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API: Añadiendo token de autenticación a la solicitud");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable para controlar si ya estamos en proceso de renovación del token
let isRefreshingToken = false;
let pendingRequests: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      console.error(
        "API: Error de autenticación (401) - Token inválido o expirado"
      );

      originalRequest._retry = true;

      if (isRefreshingToken) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve,
            reject,
            config: originalRequest,
          });
        });
      }

      isRefreshingToken = true;

      try {
        // Intentamos obtener un nuevo token del estado de Redux
        const state = store.getState();
        const newToken = state.auth.token;

        if (newToken) {
          console.log("API: Usando token existente del estado");

          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          pendingRequests.forEach((request) => {
            if (!request.config.headers) {
              request.config.headers = {};
            }
            request.config.headers.Authorization = `Bearer ${newToken}`;
            request.resolve(axiosInstance(request.config));
          });

          pendingRequests = [];

          return axiosInstance(originalRequest);
        } else {
          console.error("API: No hay token disponible en el estado");
          pendingRequests.forEach((request) => {
            request.reject(error);
          });
          pendingRequests = [];
        }
      } catch (refreshError) {
        console.error("API: Error al renovar el token:", refreshError);
        pendingRequests.forEach((request) => {
          request.reject(error);
        });
        pendingRequests = [];
      } finally {
        isRefreshingToken = false;
      }
    }

    return Promise.reject(error);
  }
);

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export async function apiRequest<T>(
  method: "get" | "post" | "put" | "delete",
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

  const fullUrl = url.startsWith("http")
    ? url
    : url.startsWith("/")
    ? `${API_BASE_URL}${url}`
    : `${API_BASE_URL}/${url}`;

  const secureUrl =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? fullUrl.replace("http:", "https:")
      : fullUrl;

  console.log(`API REQUEST: [${method.toUpperCase()}] ${secureUrl}`);

  while (retries <= maxRetries) {
    try {
      let response: AxiosResponse;

      const startTime = Date.now();

      // Si estamos enviando FormData, verificar que no se esté modificando el Content-Type
      if (data instanceof FormData) {
        console.log("Enviando FormData al backend - Verificando headers");
        
        // Asegurarnos de que no se establezca Content-Type para FormData
        if (axiosConfig.headers) {
          if (axiosConfig.headers["Content-Type"]) {
            console.log("Eliminando Content-Type para FormData");
            delete axiosConfig.headers["Content-Type"];
          }
        }
        
        // Mostrar las claves del FormData que se enviarán
        console.log("Claves en FormData que se enviarán:");
        for (const [key] of data.entries()) {
          console.log(`- ${key}`);
        }
      }
      
      switch (method) {
        case "get":
          response = await axiosInstance.get(secureUrl, axiosConfig);
          break;
        case "post":
          response = await axiosInstance.post(secureUrl, data, axiosConfig);
          break;
        case "put":
          response = await axiosInstance.put(secureUrl, data, axiosConfig);
          break;
        case "delete":
          response = await axiosInstance.delete(secureUrl, axiosConfig);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      const requestTime = Date.now() - startTime;

      // Log response basics
      console.log(
        `API RESPONSE: [${method.toUpperCase()}] ${secureUrl} - Status: ${
          response.status
        } (${requestTime}ms)`
      );

      if (!response.data) {
        console.warn(`API WARNING: Empty response data from ${secureUrl}`);
        return {} as T;
      }

      return response.data as T;
    } catch (error: any) {
      lastError = error as AxiosError | Error;

      console.error(`API ERROR [${method.toUpperCase()}] ${secureUrl}:`, error);

      if (error.response) {
        if (error.response.status === 401) {
          console.error("Error de autenticación: Token inválido o expirado");
        }
        console.error(`Status: ${error.response.status}`, error.response.data);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor", error.request);
      } else {
        console.error("Error al configurar la solicitud:", error.message);
      }

      if (
        retries < maxRetries &&
        error instanceof AxiosError &&
        retryCondition(error) &&
        !(error.response && error.response.status === 401)
      ) {
        retries++;

        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        axiosConfig.timeout = (axiosConfig.timeout || DEFAULT_TIMEOUT) * 1.5;

        console.warn(
          `Reintentando solicitud (${retries}/${maxRetries}): ${secureUrl}`
        );
      } else {
        break;
      }
    }
  }

  handleApiError(lastError);

  throw lastError;
}

/**
 * Determine if a request should be retried based on the type of error
 */
function defaultRetryCondition(error: AxiosError): boolean {
  return (
    !error.response || // Network error
    error.code === "ECONNABORTED" || // Timeout
    [408, 429, 500, 502, 503, 504].includes(error.response?.status || 0) // Certain HTTP errors
  );
}

/**
 * Handle API errors and format them for better diagnosis
 */
export function handleApiError(error: AxiosError | Error | null): never {
  if (!error) {
    throw new Error("Se produjo un error desconocido");
  }

  if (axios.isAxiosError(error)) {
    let message = "Error en la solicitud";
    let details = "";

    if (error.response) {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
      details = JSON.stringify(error.response.data, null, 2);
    } else if (error.request) {
      message = "No se recibió respuesta del servidor";
      details =
        error.code === "ECONNABORTED"
          ? "La solicitud excedió el tiempo máximo de espera"
          : error.message;
    } else {
      message = "Error al configurar la solicitud";
      details = error.message;
    }

    console.error(`${message}\n${details}`);

    const enhancedError = new Error(message);
    enhancedError.name = "ApiError";
    (enhancedError as any).originalError = error;
    (enhancedError as any).details = details;

    throw enhancedError;
  }

  console.error(`Error: ${error.message}`);
  throw error;
}

/**
 * Realize multiple requests in parallel and control errors
 */
export async function batchRequests<T>(
  requests: Promise<any>[],
  allOrNothing: boolean = false
): Promise<T[]> {
  if (allOrNothing) {
    return Promise.all(requests) as Promise<T[]>;
  } else {
    const results = await Promise.allSettled(requests);

    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<T> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .forEach((result, index) => {
        console.error(`La solicitud ${index} falló:`, result.reason);
      });

    return successfulResults;
  }
}

/**
 * Download a file from the API
 * @param url Relative URL for the download
 * @param config Additional configuration for the request
 * @returns Promise with the download URL or null if an error occurs
 */
export async function downloadFile(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<string> {
  const fullUrl = url.startsWith("http")
    ? url
    : url.startsWith("/")
    ? `${API_BASE_URL}${url}`
    : `${API_BASE_URL}/${url}`;

  const secureUrl =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? fullUrl.replace("http:", "https:")
      : fullUrl;

  try {
    const response = await axiosInstance.get(secureUrl, {
      ...config,
      responseType: "json",
    });

    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.enlace
    ) {
      return response.data.enlace;
    } else if (response.data && typeof response.data === "string") {
      return response.data;
    } else {
      throw new Error("No se pudo obtener una URL válida para el documento");
    }
  } catch (error) {
    handleApiError(error as AxiosError | Error);
    throw error;
  }
}

export function get<T>(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  const urlWithTimestamp = url.includes("?")
    ? `${url}&_t=${Date.now()}`
    : `${url}?_t=${Date.now()}`;

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return apiRequest<T>("get", urlWithTimestamp, undefined, {
      ...config,
      baseURL: API_BASE_URL?.replace("http:", "https:"),
    });
  }

  return apiRequest<T>("get", urlWithTimestamp, undefined, config);
}

export function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  // Si estamos enviando FormData, asegurarnos de que no se establezca Content-Type
  // para que el navegador pueda establecer el boundary correcto
  if (data instanceof FormData) {
    return apiRequest<T>("post", url, data, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': undefined // Permitir que el navegador establezca el Content-Type correcto
      }
    });
  }
  
  return apiRequest<T>("post", url, data, config);
}

export function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("put", url, data, config);
}

export function del<T>(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("delete", url, undefined, config);
}
