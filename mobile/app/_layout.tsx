import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
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

import { BornblixThemeProvider } from '../src/components/ThemeProvider';
import { useBornblixTheme } from '../src/lib/themes';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_yourkeyhere'; // Replace with real key from Clerk dashboard

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const theme = useBornblixTheme();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Redirect logic
    if (!isSignedIn && !inAuthGroup) {
      // Redirect to auth if not signed in
      router.replace('/(auth)/splash');
    } else if (isSignedIn && inAuthGroup) {
      // Redirect to home if signed in
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments, router]);

  // Hide splash when loaded
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
      {/* Auth Group */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Main App Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Other screens */}
      <Stack.Screen name="chat" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
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

  if (!loaded) {
    return null; // Or custom loading
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BornblixThemeProvider>
        <RootLayoutNav />
        <StatusBar style="light" /> {/* Default to light for dark sanctuary mode */}
      </BornblixThemeProvider>
    </ClerkProvider>
  );
}
