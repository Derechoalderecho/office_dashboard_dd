// Centralized logging system that optimizes performance
// Based on levels and avoids unnecessary logs in production

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Global logging configuration
const config = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableGrouping: true,
  enableColors: true,
  forceDebugLogs: Boolean(process.env.DEBUG_LOGS) || false
};

// Force all logs if the environment variable is enabled
if (config.forceDebugLogs) {
  config.level = LogLevel.DEBUG;
}

// Style for each level
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
 * Update the logging configuration
 */
export function configureLogger(options: Partial<typeof config>) {
  Object.assign(config, options);
}

/**
 * Determine if a log level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  return level >= config.level;
}

/**
 * Log of level DEBUG - detailed information for development
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
 * Log of level INFO - general system information
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
 * Log of level WARN - warnings and non-critical problems
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
 * Log of level ERROR - system errors
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
 * Nested log group
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
  
  return {
    end: () => {}
  };
}

/**
 * Measure the execution time of a function
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
 * Measure the execution time of an asynchronous function
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

// Export as an object for more convenient use
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