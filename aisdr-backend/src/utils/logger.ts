import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export class Logger{
  
  /**
   * Log an informational message.
   * @param message – whatever you want to log
   * @param filename – optional: file under logs/ (defaults to "express.log")
   */
  static info(message: string, filename?: string) {
    this.writeLog('info', message, filename);
  }

  /**
   * Log an error message.
   * @param message – whatever you want to log
   * @param filename – optional: file under logs/ (defaults to "express.log")
   */
  static warn(message: string, filename?: string) {
    this.writeLog('warn', message, filename);
  }

  /**
   * Log an error message.
   * @param message – whatever you want to log
   * @param filename – optional: file under logs/ (defaults to "express.log")
   */
  static error(message: string, filename?: string) {
    this.writeLog('error', message, filename);
  }

  private static writeLog(level: 'info' | 'warn' | 'error', message: string, filename = 'express.log'): void {
    const filePath  = path.join(logsDir, filename);
    const timestamp = new Date().toISOString();
    const line      = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(filePath, line);
  }
};
