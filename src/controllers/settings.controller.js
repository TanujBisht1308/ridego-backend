import { fetchSettings, saveSettings } from '../services/settings.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// GET /api/driver/settings
export const getSettingsHandler = async (req, res, next) => {
  try {
    const settings = await fetchSettings(req.driver.id);
    if (!settings) return errorResponse(res, 'Settings not found', 404);
    return successResponse(res, settings, 'Settings fetched');
  } catch (err) {
    next(err);
  }
};

// PUT /api/driver/settings
export const updateSettingsHandler = async (req, res, next) => {
  try {
    const { soundAndVibration, navigationApp, onlinePreferences } = req.body;
    const settings = await saveSettings(req.driver.id, {
      soundAndVibration,
      navigationApp,
      onlinePreferences,
    });
    return successResponse(res, settings, 'Settings updated');
  } catch (err) {
    next(err);
  }
};