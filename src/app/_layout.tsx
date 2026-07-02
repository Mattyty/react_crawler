import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppStateProvider } from '@/context/AppStateContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <OnboardingFlow />
        <Stack screenOptions={{ headerShown: false }} />
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
