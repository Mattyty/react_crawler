import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { usePostHog } from 'posthog-react-native';
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

type PushDebug = (stage: string, detail?: Record<string, any>) => void;

async function registerForPushNotificationsAsync(debug: PushDebug): Promise<string | null> {
  // Remote push only works on physical devices, never on simulators/emulators.
  if (!Device.isDevice) {
    debug('not_a_device');
    return null;
  }

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
  debug('permission_status', { status: finalStatus });
  if (finalStatus !== 'granted') return null;

  // projectId is required on EAS/standalone builds to mint an Expo push token.
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;
  debug('project_id', { projectId: projectId ?? null });
  if (!projectId) return null;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    debug('token_ok', { token: tokenResponse.data });
    return tokenResponse.data;
  } catch (e: any) {
    debug('token_error', { message: e?.message ?? String(e) });
    return null;
  }
}

/**
 * Registers this device for Expo push notifications and keeps the stored
 * city/persona up to date in the Supabase `device_tokens` table.
 */
export function usePushNotifications() {
  const { currentCity, userPersona } = useAppState();
  const posthog = usePostHog();
  const tokenRef = useRef<string | null>(null);

  // Register the token once on mount (after permission is granted).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    // TEMP diagnostics: surface each stage to PostHog so we can see where push
    // registration fails on device without a console. Remove once confirmed.
    const debug: PushDebug = (stage, detail) => {
      console.log('[push]', stage, detail ?? '');
      posthog?.capture('push_debug', { stage, ...(detail ?? {}) });
    };
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync(debug);
        if (cancelled || !token) return;
        tokenRef.current = token;
        await upsertToken(token, currentCity, userPersona, debug);
      } catch (e: any) {
        debug('unexpected_error', { message: e?.message ?? String(e) });
      }
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

async function upsertToken(token: string, city: string, persona: string, debug?: PushDebug) {
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
    debug?.('upsert_error', { message: error.message });
    console.warn('[push] device_tokens upsert failed:', error.message);
  } else {
    debug?.('upsert_ok', { city: city || null, persona: persona || null });
  }
}
