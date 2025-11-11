/**
 * Centralized logging utility for the Mobile app
 * Supports environment-based log levels and structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = __DEV__ ? 'debug' : 'error';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (args.length === 0) {
      return `${prefix} ${message}`;
    }
    try {
      const serialized = JSON.stringify(args, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
        , 2);
      return `${prefix} ${message} ${serialized}`;
    } catch {
      return `${prefix} ${message} [Unable to serialize arguments]`;
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog('error')) {
      if (!error) {
        console.error(this.formatMessage('error', message));
        return;
      }
      const errorDetails = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
      console.error(
        this.formatMessage('error', message, errorDetails, ...args)
      );
    }
  }
}

const loggerInstance = new Logger();
export default loggerInstance;

