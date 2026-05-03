import { Redirect, useRootNavigationState } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

/**
 * Initial URL `/` must resolve to a screen; without this file the stack can render empty (blank UI).
 */
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const rootNav = useRootNavigationState();

  if (!isLoaded || !rootNav?.key) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/splash" />;
}
