import { useAuth } from '@clerk/clerk-expo';
import { Pressable, Text, View } from 'react-native';

export default function ProfileTab() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-bgPrimary items-center justify-center px-6 gap-6">
      <Text
        className="text-gold text-2xl font-bold text-center"
        style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
      >
        Profile
      </Text>
      <Text className="text-textSec text-center" style={{ fontFamily: 'Nunito_400Regular' }}>
        Account and settings will live here.
      </Text>
      <Pressable onPress={() => void signOut()} className="py-3 px-6 rounded-xl bg-white/10">
        <Text className="text-red-400 font-semibold" style={{ fontFamily: 'Nunito_600SemiBold' }}>
          Sign out
        </Text>
      </Pressable>
    </View>
  );
}
