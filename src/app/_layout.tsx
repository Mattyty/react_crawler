import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AppStateProvider } from '@/context/AppStateContext';

export default function RootLayout() {
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
