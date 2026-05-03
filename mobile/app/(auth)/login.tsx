import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { MotiView } from 'moti';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useBornblixTheme } from '../../src/lib/themes';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme } = useBornblixTheme('journal');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleEmailSignIn = async () => {
    if (!email) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    try {
      // For demo, simulate OTP flow. In production, use Clerk's full flow with OTP
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/(auth)/otp?email=' + encodeURIComponent(email));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Similar for Apple, Clerk supports oauth_apple
    alert('Apple Sign In would be implemented with Clerk OAuth here');
    // router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#F8F7F3' }}
    >
      <View className="flex-1 px-8 pt-20">
        {/* Logo */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-[#F97316] rounded-3xl items-center justify-center mb-6 shadow-xl" style={{ shadowColor: '#F0C060' }}>
            <Text style={{ fontSize: 52 }}>📖</Text>
          </View>
          <Text className="text-5xl font-bold tracking-tighter" style={{ color: '#0D0D14', fontFamily: 'PlayfairDisplay_700Bold' }}>
            Bornblix
          </Text>
        </View>

        <Text className="text-4xl font-semibold text-center mb-2" style={{ color: '#0D0D14', fontFamily: 'Nunito_700Bold' }}>
          Welcome back
        </Text>
        <Text className="text-center text-xl text-gray-600 mb-12" style={{ fontFamily: 'DMSans_400Regular' }}>
          Log in or sign up to continue your journey
        </Text>

        {/* Email Input */}
        <View className="mb-8">
          <Text className="text-sm font-medium mb-2 text-gray-500 ml-1" style={{ fontFamily: 'DMSans_400Regular' }}>EMAIL ADDRESS</Text>
          <View className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex-row items-center">
            <Ionicons name="mail-outline" size={22} color="#666" />
            <TextInput
              className="flex-1 ml-3 text-lg"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ fontFamily: 'DMSans_400Regular' }}
            />
            {email.length > 0 && (
              <TouchableOpacity onPress={() => setEmail('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleEmailSignIn}
          disabled={isLoading || !email}
          className="bg-black py-5 rounded-3xl mb-6 active:bg-gray-800"
        >
          <Text className="text-white text-center text-xl font-semibold" style={{ fontFamily: 'Nunito_700Bold' }}>
            {isLoading ? 'CONTINUING...' : 'Continue with Email'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-6 text-gray-400 text-sm" style={{ fontFamily: 'DMSans_400Regular' }}>or</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Social Buttons */}
        <TouchableOpacity 
          onPress={handleGoogleSignIn}
          className="bg-white border border-gray-200 py-4 rounded-3xl flex-row items-center justify-center gap-3 mb-4 active:bg-gray-50"
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text className="font-semibold text-lg text-gray-800" style={{ fontFamily: 'Nunito_600SemiBold' }}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleAppleSignIn}
          className="bg-black py-4 rounded-3xl flex-row items-center justify-center gap-3 active:bg-gray-900"
        >
          <Ionicons name="logo-apple" size={26} color="white" />
          <Text className="font-semibold text-lg text-white" style={{ fontFamily: 'Nunito_600SemiBold' }}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/splash')}
          className="mt-auto mb-8 self-center"
        >
          <Text className="text-gray-500 text-sm" style={{ fontFamily: 'DMSans_400Regular' }}>← Back to splash</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
