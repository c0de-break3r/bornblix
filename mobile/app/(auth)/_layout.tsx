import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

/**
 * Auth-only routes. Signed-in users are sent to `/` (index → main app).
 * Mirrors Clerk’s Expo Router quickstart pattern; package is `@clerk/clerk-expo` (not `@clerk/expo`).
 */
export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
