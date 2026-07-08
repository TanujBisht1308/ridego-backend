import {
  getSettings,
  updateSettings,
} from '../repositories/settings.repository.js';

const toPublicSettings = (row) => ({
  soundAndVibration: row.sound_and_vibration,
  navigationApp: row.navigation_app,
  onlinePreferences: row.online_preferences,
});

export const fetchSettings = async (driverId) => {
  const settings = await getSettings(driverId);
  return settings ? toPublicSettings(settings) : null;
};

export const saveSettings = async (driverId, data) => {
  const settings = await updateSettings(driverId, data);
  return toPublicSettings(settings);
};