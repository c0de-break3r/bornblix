import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../src/global.css';

import { initSentry, wrapRootComponent } from '@/src/instrumentation/sentry';
import SocketConnection from '@/src/components/SocketConnection';
import { BornblixThemeProvider, useBornblixTheme } from '../src/components/ThemeProvider';

initSentry();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';

if (!publishableKey) {
  throw new Error(
    'Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to mobile/.env. Get your key at https://dashboard.clerk.com — use the Expo integration.'
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedStatusBar() {
  const { resolvedScheme } = useBornblixTheme();
  return <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />;
}

function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0D0D14' }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <BornblixThemeProvider>
          <QueryClientProvider client={queryClient}>
            <SocketConnection />
            <Slot />
            <ThemedStatusBar />
          </QueryClientProvider>
        </BornblixThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

export default wrapRootComponent(RootLayout);
