import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { postApi } from './profileApi';
export const syncPendingAndroidNotificationsToNeon = async () => {
  try {
    const { value: firebaseUserId } = await Preferences.get({ key: 'firebase_user_id' });
    const { value: userEmail } = await Preferences.get({ key: 'user_email' });
    if (!firebaseUserId && !userEmail) return;
    const pending = await LocalNotifications.getPending();
    if (!pending?.notifications?.length) return;
    await postApi('api/sync/notifications', { firebaseUserId, email: userEmail, targetTable: 'scheduled_notifications', localData: pending.notifications });
  } catch (error) { console.error('Cloudflare notification sync error:', error.message); }
};
export const initializeNotificationsSyncListener = () => window.addEventListener('trigger_sync_notifications', syncPendingAndroidNotificationsToNeon);
