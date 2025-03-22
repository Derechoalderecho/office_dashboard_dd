// Sistema centralizado de logs que optimiza el rendimiento
// Basado en niveles y evita logs innecesarios en producción

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Configuración global de logs
const config = {
  // En producción, solo mostrar WARN y ERROR por defecto
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableGrouping: true,
  enableColors: true,
  // Permitir habilitar logs detallados con una variable de entorno
  forceDebugLogs: Boolean(process.env.DEBUG_LOGS) || false
};

// Forzar todos los logs si la variable de entorno está habilitada
if (config.forceDebugLogs) {
  config.level = LogLevel.DEBUG;
}

// Estilo para cada nivel
const styles = {
  [LogLevel.DEBUG]: { 
    prefix: '🔍 DEBUG:',
    style: 'color: #6c757d;'
  },
  [LogLevel.INFO]: { 
    prefix: 'ℹ️ INFO:',
    style: 'color: #0d6efd;'
  },
  [LogLevel.WARN]: { 
    prefix: '⚠️ WARN:',
    style: 'color: #fd7e14; font-weight: bold;'
  },
  [LogLevel.ERROR]: { 
    prefix: '❌ ERROR:',
    style: 'color: #dc3545; font-weight: bold;'
  }
};

/**
 * Actualiza la configuración de logging
 */
export function configureLogger(options: Partial<typeof config>) {
  Object.assign(config, options);
}

/**
 * Determina si un nivel de log debe mostrarse
 */
function shouldLog(level: LogLevel): boolean {
  return level >= config.level;
}

/**
 * Log de nivel DEBUG - información detallada para desarrollo
 */
export function debug(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.DEBUG)) {
    if (config.enableColors && typeof window !== 'undefined') {
      console.debug(
        `%c${styles[LogLevel.DEBUG].prefix} ${message}`, 
        styles[LogLevel.DEBUG].style, 
        ...args
      );
    } else {
      console.debug(`${styles[LogLevel.DEBUG].prefix} ${message}`, ...args);
    }
  }
}

/**
 * Log de nivel INFO - información general del sistema
 */
export function info(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.INFO)) {
    if (config.enableColors && typeof window !== 'undefined') {
      console.info(
        `%c${styles[LogLevel.INFO].prefix} ${message}`, 
        styles[LogLevel.INFO].style, 
        ...args
      );
    } else {
      console.info(`${styles[LogLevel.INFO].prefix} ${message}`, ...args);
    }
  }
}

/**
 * Log de nivel WARN - advertencias y problemas no críticos
 */
export function warn(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.WARN)) {
    if (config.enableColors && typeof window !== 'undefined') {
      console.warn(
        `%c${styles[LogLevel.WARN].prefix} ${message}`, 
        styles[LogLevel.WARN].style, 
        ...args
      );
    } else {
      console.warn(`${styles[LogLevel.WARN].prefix} ${message}`, ...args);
    }
  }
}

/**
 * Log de nivel ERROR - errores del sistema
 */
export function error(message: string | Error, ...args: any[]): void {
  if (shouldLog(LogLevel.ERROR)) {
    const errorMessage = message instanceof Error ? message.message : message;
    const stack = message instanceof Error ? message.stack : null;
    
    if (config.enableColors && typeof window !== 'undefined') {
      console.error(
        `%c${styles[LogLevel.ERROR].prefix} ${errorMessage}`, 
        styles[LogLevel.ERROR].style, 
        ...args
      );
      if (stack) console.error(stack);
    } else {
      console.error(`${styles[LogLevel.ERROR].prefix} ${errorMessage}`, ...args);
      if (stack) console.error(stack);
    }
  }
}

/**
 * Grupo de logs anidados
 */
export function group(title: string, level: LogLevel = LogLevel.DEBUG): { end: () => void } {
  if (shouldLog(level) && config.enableGrouping) {
    if (config.enableColors && typeof window !== 'undefined') {
      console.group(`%c${title}`, 'color: #0d6efd; font-weight: bold;');
    } else {
      console.group(title);
    }
    
    return {
      end: () => {
        console.groupEnd();
      }
    };
  }
  
  // No-op si no se debe mostrar
  return {
    end: () => {}
  };
}

/**
 * Mide el tiempo de ejecución de una función
 */
export function time<T>(
  label: string, 
  fn: () => T, 
  level: LogLevel = LogLevel.DEBUG
): T {
  if (!shouldLog(level)) {
    return fn();
  }
  
  const start = performance.now();
  try {
    return fn();
  } finally {
    const elapsed = performance.now() - start;
    if (config.enableColors && typeof window !== 'undefined') {
      console.log(
        `%c⏱️ TIMING: ${label} - ${elapsed.toFixed(2)}ms`, 
        'color: #6610f2;'
      );
    } else {
      console.log(`⏱️ TIMING: ${label} - ${elapsed.toFixed(2)}ms`);
    }
  }
}

/**
 * Mide el tiempo de ejecución de una función asíncrona
 */
export async function timeAsync<T>(
  label: string, 
  fn: () => Promise<T>, 
  level: LogLevel = LogLevel.DEBUG
): Promise<T> {
  if (!shouldLog(level)) {
    return fn();
  }
  
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const elapsed = performance.now() - start;
    if (config.enableColors && typeof window !== 'undefined') {
      console.log(
        `%c⏱️ TIMING: ${label} - ${elapsed.toFixed(2)}ms`, 
        'color: #6610f2;'
      );
    } else {
      console.log(`⏱️ TIMING: ${label} - ${elapsed.toFixed(2)}ms`);
    }
  }
}

// Exportar como objeto para uso más conveniente
export const logger = {
  config,
  configure: configureLogger,
  debug,
  info,
  warn,
  error,
  group,
  time,
  timeAsync,
  LogLevel
}; 