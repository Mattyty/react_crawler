import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAppState } from '@/context/AppStateContext';
import { supabase } from '@/lib/supabase';

// Show notifications received while the app is foregrounded as a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Remote push only works on physical devices, never on simulators/emulators.
  if (!Device.isDevice) return null;

  // Android requires a notification channel to display notifications.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // projectId is required on EAS/standalone builds to mint an Expo push token.
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;
  if (!projectId) return null;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResponse.data;
  } catch {
    return null;
  }
}

/**
 * Registers this device for Expo push notifications and keeps the stored
 * city/persona up to date in the Supabase `device_tokens` table.
 */
export function usePushNotifications() {
  const { currentCity, userPersona } = useAppState();
  const tokenRef = useRef<string | null>(null);

  // Register the token once on mount (after permission is granted).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (cancelled || !token) return;
      tokenRef.current = token;
      await upsertToken(token, currentCity, userPersona);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount; city/persona updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the row's city/persona in sync when the user changes them.
  useEffect(() => {
    if (!tokenRef.current) return;
    upsertToken(tokenRef.current, currentCity, userPersona);
  }, [currentCity, userPersona]);
}

async function upsertToken(token: string, city: string, persona: string) {
  const row: Record<string, any> = {
    expo_push_token: token,
    updated_at: new Date().toISOString(),
  };
  if (city) row.city = city;
  if (persona) row.persona = persona;

  // No .select() chained, so supabase-js does not read the row back — this works
  // under the write-only (insert/update, no select) RLS policy on the table.
  const { error } = await supabase
    .from('device_tokens')
    .upsert(row, { onConflict: 'expo_push_token', ignoreDuplicates: false });
  if (error) {
    // Swallow — push registration must never crash the app.
    console.warn('[push] device_tokens upsert failed:', error.message);
  }
}
