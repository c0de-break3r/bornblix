import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useBornblixTheme } from '../../src/lib/themes';
import { useGamificationStore } from '../../src/store/gamificationStore';
import { StreakModal } from '../../src/components/StreakModal';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const verseOfTheDay = {
  text: "Come to me, all you who labor and are heavy laden, and I will give you rest.",
  reference: "Matthew 11:28",
  image: 'https://picsum.photos/id/1015/800/600', // Placeholder; replace with cinematic Bible image
};

export default function HomeScreen() {
  const { theme, mode } = useBornblixTheme('sanctuary');
  const { streak, level, coins, hearts, resetStreakIfNeeded } = useGamificationStore();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [shimmerOpacity, setShimmerOpacity] = useState(0.6);

  useEffect(() => {
    resetStreakIfNeeded();
    // Auto show streak modal on first visit of day (demo)
    const timer = setTimeout(() => {
      if (streak > 0) setShowStreakModal(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleFeaturePress = (feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (feature === 'streak') {
      setShowStreakModal(true);
    } else if (feature === 'chat') {
      router.push('/chat');
    } else {
      alert(`Opening ${feature}... (implement in next phase)`);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-14 px-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full border-2 border-[#F0C060] overflow-hidden bg-zinc-800">
              <Text className="text-3xl text-center mt-1">🦁</Text>
            </View>
            <View>
              <Text className="text-white/70 text-sm" style={{ fontFamily: 'DMSans_400Regular' }}>Good morning, Caroline</Text>
              <Text className="text-2xl text-white font-semibold -mt-1" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>🌅</Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="relative">
              <Ionicons name="notifications-outline" size={26} color="#F0C060" />
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-[8px] text-white font-bold">3</Text>
              </View>
            </TouchableOpacity>
            <View className="bg-white/10 px-3 py-1 rounded-2xl flex-row items-center gap-1">
              <Text className="text-[#F0C060] text-xl">🪙</Text>
              <Text className="text-white font-semibold text-lg" style={{ fontFamily: 'Nunito_700Bold' }}>{coins}</Text>
            </View>
          </View>
        </View>

        {/* Verse of the Day - Hero Card with cinematic overlay */}
        <View className="mx-4 mt-6 rounded-3xl overflow-hidden relative h-[420px] shadow-2xl" style={{ backgroundColor: '#111827' }}>
          <Image 
            source={{ uri: verseOfTheDay.image }} 
            className="absolute inset-0 w-full h-full"
            style={{ resizeMode: 'cover' }}
          />
          <LinearGradient 
            colors={['rgba(13,13,20,0.1)', 'rgba(13,13,20,0.85)', '#0D0D14']} 
            className="absolute inset-0"
          />
          
          {/* Shimmer effect */}
          <MotiView 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ translateX: [-width * 2, width * 2] }}
            transition={{ 
              type: 'timing', 
              duration: 2200, 
              repeat: Infinity,
              repeatReverse: false 
            }}
            style={{ opacity: shimmerOpacity }}
          />

          <View className="absolute bottom-0 left-0 right-0 p-8">
            <Text className="text-[#F0C060] text-sm tracking-[3px] font-medium mb-3" style={{ fontFamily: 'DMSans_400Regular' }}>
              VERSE OF THE DAY
            </Text>
            
            <Text 
              className="text-white text-3xl leading-tight font-serif mb-6"
              style={{ fontFamily: 'PlayfairDisplay_700Bold', lineHeight: 38 }}
            >
              "{verseOfTheDay.text}"
            </Text>
            
            <Text className="text-[#F0C060] text-xl mb-8" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
              — {verseOfTheDay.reference}
            </Text>

            {/* Action Row */}
            <View className="flex-row justify-between items-center">
              <View className="flex-row gap-6">
                <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Ionicons name="thumbs-up-outline" size={26} color="#F0C060" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Ionicons name="thumbs-down-outline" size={26} color="#F0C060" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row gap-5">
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // Copy to clipboard simulation
                  }}
                  className="flex-row items-center gap-2 bg-white/10 px-5 py-2.5 rounded-2xl"
                >
                  <Ionicons name="copy-outline" size={18} color="white" />
                  <Text className="text-white text-sm font-medium">Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  className="flex-row items-center gap-2 bg-white/10 px-5 py-2.5 rounded-2xl"
                >
                  <Ionicons name="share-social-outline" size={18} color="white" />
                  <Text className="text-white text-sm font-medium">Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bōōns floating badge */}
          <View className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl flex-row items-center gap-2 border border-white/20">
            <Text className="text-2xl">🦁</Text>
            <View>
              <Text className="text-white text-xs tracking-widest">BŌŌNS SAYS</Text>
              <Text className="text-amber-300 text-sm font-medium">Rest in Me today</Text>
            </View>
          </View>
        </View>

        {/* Feature Grid 2x2 */}
        <View className="px-6 pt-10 pb-24">
          <Text className="text-white text-2xl font-semibold mb-6 px-1" style={{ fontFamily: 'Nunito_700Bold' }}>
            Continue your journey
          </Text>
          
          <View className="grid grid-cols-2 gap-4">
            {/* Video Reflection */}
            <TouchableOpacity 
              onPress={() => handleFeaturePress('reflection')}
              className="bg-zinc-900/70 border border-white/10 rounded-3xl p-5 h-44 relative overflow-hidden"
            >
              <View className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-xl">
                <Text className="text-[#F0C060] text-xs">4:12</Text>
              </View>
              <Ionicons name="play-circle" size={52} color="#F0C060" style={{ opacity: 0.9 }} />
              <View className="absolute bottom-5 left-5">
                <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>Video Reflection</Text>
                <Text className="text-white/60 text-sm">The Rest Jesus Offers</Text>
              </View>
            </TouchableOpacity>

            {/* Prayer Prompt */}
            <TouchableOpacity 
              onPress={() => handleFeaturePress('prayer')}
              className="bg-zinc-900/70 border border-white/10 rounded-3xl p-5 h-44 relative overflow-hidden"
            >
              <View className="absolute -bottom-6 -right-6 text-[90px] opacity-20">🙏</View>
              <View className="mt-auto">
                <Text className="text-[#6C63FF] text-4xl mb-1">✨</Text>
                <Text className="text-white text-xl font-semibold leading-none" style={{ fontFamily: 'Nunito_700Bold' }}>Prayer Prompt</Text>
                <Text className="text-white/70 text-sm mt-1">For peace in uncertainty</Text>
              </View>
            </TouchableOpacity>

            {/* Last Note */}
            <TouchableOpacity 
              onPress={() => handleFeaturePress('notes')}
              className="bg-zinc-900/70 border border-white/10 rounded-3xl p-6 h-44"
            >
              <View className="flex-1">
                <Text className="text-amber-400 text-sm mb-3 tracking-widest">LAST NOTE</Text>
                <Text className="text-white/90 text-[17px] leading-tight font-medium" style={{ fontFamily: 'DMSans_400Regular' }}>
                  "His grace is sufficient for me in this season of waiting."
                </Text>
              </View>
              <Text className="text-xs text-white/40">2 days ago • Journal</Text>
            </TouchableOpacity>

            {/* Streak Card */}
            <TouchableOpacity 
              onPress={() => handleFeaturePress('streak')}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 h-44 flex-col justify-between border border-amber-400/30"
            >
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-amber-100 text-sm font-medium tracking-[1px]">CURRENT STREAK</Text>
                  <Text className="text-6xl font-bold text-white mt-1" style={{ fontFamily: 'Nunito_700Bold' }}>{streak}</Text>
                </View>
                <Text className="text-7xl">🔥</Text>
              </View>
              
              <View className="flex-row items-center gap-2">
                <View className="bg-white/20 text-xs px-4 py-1 rounded-2xl text-white">Lv {level}</View>
                <Text className="text-amber-200 text-sm font-medium">Keep the fire burning</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Streak Modal */}
      <StreakModal 
        visible={showStreakModal} 
        onClose={() => setShowStreakModal(false)} 
      />

      {/* Floating Bōōns Guide Hint */}
      <TouchableOpacity 
        onPress={() => router.push('/chat')}
        className="absolute bottom-28 right-6 bg-[#6C63FF] w-16 h-16 rounded-2xl items-center justify-center shadow-2xl border-2 border-white/30"
        style={{ shadowColor: '#6C63FF' }}
      >
        <Text className="text-4xl">🦁</Text>
      </TouchableOpacity>
    </View>
  );
}
