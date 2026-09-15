import { Stack } from 'expo-router';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppSplash } from '@/components/AppSplash';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AppStateProvider, useAppState } from '@/context/AppStateContext';
import { POSTHOG_API_KEY, POSTHOG_HOST } from '@/lib/analytics';

// Keeps the user's selected city & persona attached to every event as global
// (super) properties, so funnels can be segmented by persona. Runs whenever
// either value changes, including on app start once stored state hydrates.
function AnalyticsIdentity() {
  const posthog = usePostHog();
  const { currentCity, userPersona } = useAppState();

  useEffect(() => {
    if (!posthog) return;
    const props: Record<string, string> = {};
    if (currentCity) props.city = currentCity;
    if (userPersona) props.persona = userPersona;
    if (Object.keys(props).length === 0) return;
    posthog.register(props);
    posthog.capture('$set', { $set: props });
  }, [posthog, currentCity, userPersona]);

  return null;
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Brief delay to allow fonts and state hydration before revealing the app
    const timer = setTimeout(() => setAppReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <AppSplash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, maxWidth: '100%', overflow: 'hidden' }}>
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{ host: POSTHOG_HOST }}
        autocapture={{ captureScreens: false, captureTouches: false }}
      >
        <AppStateProvider>
          <AnalyticsIdentity />
          <OnboardingFlow />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </AppStateProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
