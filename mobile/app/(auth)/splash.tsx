import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ReferenceAssets } from '@/src/constants/referenceAssets';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    // Auto transition after animation
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.replace('/(auth)/onboarding');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View 
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: '#1A0A2E' }} // Deep indigo as per spec
    >
      {/* Background subtle gradient mesh effect simulation */}
      <View className="absolute inset-0 opacity-30" 
        style={{
          backgroundColor: 'transparent',
          // Could use SVG for mesh but for now simple
        }} 
      />

      {/* Animated Bōōns Lion Mascot */}
      <MotiView
        from={{ opacity: 0, scale: 0.85, translateY: 40 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="mb-6 items-center justify-center"
      >
        <View className="rounded-[40px] overflow-hidden border-4 border-[#F0C060]/90 shadow-2xl" style={{
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.45,
          shadowRadius: 24,
          elevation: 12,
        }}>
          <Image
            source={ReferenceAssets.bornblixAppIcon}
            style={{ width: width * 0.52, height: width * 0.52, maxWidth: 220, maxHeight: 220 }}
            contentFit="contain"
            transition={200}
          />
        </View>
      </MotiView>

      {/* BORNBLIX Wordmark */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 800, type: 'spring' }}
      >
        <Text 
          className="text-7xl font-bold tracking-tighter text-center"
          style={{ 
            color: '#F0C060', 
            fontFamily: 'PlayfairDisplay_700Bold',
            textShadowColor: 'rgba(240, 192, 96, 0.5)',
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 20
          }}
        >
          BORNBLIX
        </Text>
      </MotiView>

      {/* Tagline */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1400 }}
      >
        <Text 
          className="text-xl text-white/80 mt-3 text-center px-12 font-medium tracking-wide"
          style={{ fontFamily: 'Nunito_600SemiBold' }}
        >
          Beyond the Verse. Into the Word.
        </Text>
      </MotiView>

      {/* Subtle loading indicator */}
      <MotiView 
        className="absolute bottom-20"
        from={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1500, repeat: Infinity }}
      >
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2 bg-[#F0C060] rounded-full" />
          <View className="w-2 h-2 bg-[#6C63FF] rounded-full" />
          <View className="w-2 h-2 bg-[#F0C060] rounded-full" />
        </View>
      </MotiView>

      {/* Tap to continue */}
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace('/(auth)/onboarding');
        }}
        className="absolute bottom-12 px-10 py-3 border border-white/30 rounded-full"
        style={{ borderColor: '#F0C060' }}
      >
        <Text className="text-white/70 text-sm tracking-widest font-medium" style={{ fontFamily: 'DMSans_400Regular' }}>
          TAP TO BEGIN YOUR JOURNEY
        </Text>
      </TouchableOpacity>
    </View>
  );
}
