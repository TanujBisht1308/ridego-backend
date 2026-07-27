import { pool } from '../config/db.js';

const timestamp = () => new Date().toISOString();

const persist = async (level, message, meta) => {
  try {
    await pool.query(
      'INSERT INTO system_logs (level, message, meta) VALUES ($1, $2, $3)',
      [level, message, meta ? JSON.stringify(meta) : null]
    );
  } catch (_) {
    // never let logging itself crash the app
  }
};

export const logger = {
  info: (...args) => {
    console.log(`[INFO] ${timestamp()} -`, ...args);
    persist('info', args.map(String).join(' '));
  },
  warn: (...args) => {
    console.warn(`[WARN] ${timestamp()} -`, ...args);
    persist('warn', args.map(String).join(' '));
  },
  error: (...args) => {
    console.error(`[ERROR] ${timestamp()} -`, ...args);
    persist('error', args.map(String).join(' '));
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${timestamp()} -`, ...args);
    }
  },
};