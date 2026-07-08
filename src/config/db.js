// PostgreSQL connection pool (Supabase).
// This is the only place that configures the raw pg connection —
// all queries themselves live in the repositories layer.

import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database Connected Successfully');
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
    process.exit(1);
  }
};