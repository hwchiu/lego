// ─── Notification Settings API ─────────────────────────────────────────────
// Handles fetching and updating user notification preferences.

/** Raw API response / request shape for notification settings */
export interface NotificationSettingsPayload {
  is_notice_enable: 'Y' | 'N';
  is_email_enable: 'Y' | 'N';
  is_event_booking_enable: 'Y' | 'N';
}

/** UI-friendly representation of notification settings */
export interface NotificationSettings {
  notification: boolean;
  email: boolean;
  eventBooking: boolean;
}

/** Convert API payload (Y/N) to UI booleans */
export function payloadToSettings(payload: NotificationSettingsPayload): NotificationSettings {
  return {
    notification: payload.is_notice_enable === 'Y',
    email: payload.is_email_enable === 'Y',
    eventBooking: payload.is_event_booking_enable === 'Y',
  };
}

/** Convert UI booleans back to API payload (Y/N) */
export function settingsToPayload(settings: NotificationSettings): NotificationSettingsPayload {
  return {
    is_notice_enable: settings.notification ? 'Y' : 'N',
    is_email_enable: settings.email ? 'Y' : 'N',
    is_event_booking_enable: settings.eventBooking ? 'Y' : 'N',
  };
}

const API_BASE = process.env.NODE_ENV === 'production' ? '/lego' : '';

/**
 * Fetch the current user notification settings.
 * Calls GET /getNotificationSettings (no input parameters required).
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const res = await fetch(`${API_BASE}/getNotificationSettings`);
  if (!res.ok) throw new Error(`getNotificationSettings failed: ${res.status}`);
  const payload = (await res.json()) as NotificationSettingsPayload;
  return payloadToSettings(payload);
}

/**
 * Persist updated notification settings for the current user.
 * Calls POST /updateNotificationSettings with the full settings payload.
 */
export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  const payload = settingsToPayload(settings);
  const res = await fetch(`${API_BASE}/updateNotificationSettings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateNotificationSettings failed: ${res.status}`);
}
