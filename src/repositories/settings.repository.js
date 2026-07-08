import { pool } from '../config/db.js';

export const getSettings = async (driverId) => {
  const result = await pool.query(
    'SELECT sound_and_vibration, navigation_app, online_preferences FROM driver_settings WHERE driver_id = $1',
    [driverId]
  );
  return result.rows[0] || null;
};

export const updateSettings = async (driverId, { soundAndVibration, navigationApp, onlinePreferences }) => {
  const result = await pool.query(
    `INSERT INTO driver_settings (driver_id, sound_and_vibration, navigation_app, online_preferences)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (driver_id)
     DO UPDATE SET
       sound_and_vibration = $2,
       navigation_app = $3,
       online_preferences = $4,
       updated_at = NOW()
     RETURNING sound_and_vibration, navigation_app, online_preferences`,
    [driverId, soundAndVibration, navigationApp, onlinePreferences]
  );
  return result.rows[0];
};