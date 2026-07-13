import admin from '../config/firebase.js';

// Sends a push notification. Returns true on success, false on failure
// (e.g. invalid/stale token) — callers should not crash if this fails,
// since sockets are still the primary real-time channel; push is a backup
// for when the app is fully closed.
export const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
  if (!fcmToken) return false;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'ridego_rides',
        },
      },
    });
    return true;
  } catch (err) {
    console.error('[FCM] Failed to send push:', err.message);
    return false;
  }
};