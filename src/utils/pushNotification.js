import { messaging } from '../config/firebase.js';

export const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
  if (!fcmToken) return false;

  try {
    await messaging.send({
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