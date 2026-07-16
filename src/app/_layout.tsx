import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppSplash } from '@/components/AppSplash';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AppStateProvider } from '@/context/AppStateContext';

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
      <AppStateProvider>
        <OnboardingFlow />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
