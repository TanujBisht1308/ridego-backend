import { pool } from '../config/db.js';

export const getBalance = async (customerId) => {
  const result = await pool.query('SELECT wallet_balance FROM customers WHERE id = $1', [customerId]);
  return Number(result.rows[0]?.wallet_balance ?? 0);
};

export const getTransactions = async (customerId, limit = 20) => {
  const result = await pool.query(
    `SELECT id, type, amount, description, created_at
     FROM wallet_transactions
     WHERE customer_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [customerId, limit]
  );
  return result.rows;
};

// Adds money — credit only, since no real payment gateway is wired in yet.
// Runs as one transaction so the balance and ledger never drift apart.
export const creditWallet = async (customerId, amount, description) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(
      `UPDATE customers SET wallet_balance = wallet_balance + $1, updated_at = NOW()
       WHERE id = $2 RETURNING wallet_balance`,
      [amount, customerId]
    );
    const tx = await client.query(
      `INSERT INTO wallet_transactions (customer_id, type, amount, description)
       VALUES ($1, 'credit', $2, $3) RETURNING *`,
      [customerId, amount, description]
    );
    await client.query('COMMIT');
    return { balance: Number(updated.rows[0].wallet_balance), transaction: tx.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Debits for ride payments — fails if balance is insufficient.
export const debitWallet = async (customerId, amount, description, rideId = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT wallet_balance FROM customers WHERE id = $1 FOR UPDATE', [customerId]);
    const balance = Number(current.rows[0].wallet_balance);

    if (balance < amount) {
      await client.query('ROLLBACK');
      return null; // insufficient balance
    }

    const updated = await client.query(
      `UPDATE customers SET wallet_balance = wallet_balance - $1, updated_at = NOW()
       WHERE id = $2 RETURNING wallet_balance`,
      [amount, customerId]
    );
    const tx = await client.query(
      `INSERT INTO wallet_transactions (customer_id, type, amount, description, ride_id)
       VALUES ($1, 'debit', $2, $3, $4) RETURNING *`,
      [customerId, amount, description, rideId]
    );
    await client.query('COMMIT');
    return { balance: Number(updated.rows[0].wallet_balance), transaction: tx.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};