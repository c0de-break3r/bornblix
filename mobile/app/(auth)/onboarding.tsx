import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

import { useBornblixTheme } from '../../src/components/ThemeProvider';
import { ReferenceAssets } from '@/src/constants/referenceAssets';

const { width } = Dimensions.get('window');

const quizOptions = [
  { emoji: '🕊️', label: 'Peace', color: '#6C63FF' },
  { emoji: '💪', label: 'Purpose', color: '#F97316' },
  { emoji: '❤️', label: 'Healing', color: '#FF6B6B' },
  { emoji: '📖', label: 'Knowledge', color: '#F0C060' },
];

const ageOptions = Array.from({ length: 15 }, (_, i) => 18 + i); // 18-32 example

export default function OnboardingScreen() {
  const { theme } = useBornblixTheme();
  const [step, setStep] = useState(0);
  const [selectedSeeking, setSelectedSeeking] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((step + 1) / 3) * 100;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && selectedSeeking) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
      }, 1800); // Simulate "Curating your 7-day peace plan..."
    } else if (step === 2 && selectedAge) {
      // Complete onboarding → Clerk sign-in
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/sign-in');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome — reference Join Our Community + mascot-led flow
        return (
          <View className="flex-1 items-center justify-center px-6">
            <MotiView
              from={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 200 }}
              className="w-full items-center mb-8"
            >
              <View className="w-full max-w-[340px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-white/5">
                <Image
                  source={ReferenceAssets.joinCommunity}
                  style={{ width: '100%', height: width * 0.42 }}
                  contentFit="cover"
                />
              </View>
            </MotiView>

            <MotiView
              from={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 350 }}
              className="mb-4 flex-row items-end justify-center gap-2"
            >
              <Image
                source={ReferenceAssets.bornblixAppIcon}
                style={{ width: 72, height: 72, borderRadius: 20 }}
                contentFit="contain"
              />
              <Text
                className="text-5xl font-bold text-center mb-1 text-white"
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
              >
                Bôôns
              </Text>
            </MotiView>
            <Text 
              className="text-3xl font-semibold text-center text-white/90 mb-8 tracking-tight"
              style={{ fontFamily: 'Nunito_700Bold' }}
            >
              Learn the Word with Clarity
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              className="w-full bg-[#F97316] py-5 rounded-3xl items-center active:opacity-90"
              style={{ shadowColor: '#F0C060', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20 }}
            >
              <Text className="text-white text-2xl font-semibold tracking-wider" style={{ fontFamily: 'Nunito_700Bold' }}>
                Start Learning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/sign-in')}
              className="mt-8"
            >
              <Text className="text-white/70 text-base" style={{ fontFamily: 'DMSans_400Regular' }}>
                Already have an account? <Text className="text-[#F0C060] font-semibold">Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 1: // Personalization Quiz
        return (
          <View className="flex-1 px-6 pt-12">
            <View className="mb-10">
              <Text className="text-4xl font-bold text-center mb-2" style={{ color: theme.colors.text, fontFamily: 'PlayfairDisplay_700Bold' }}>
                What are you seeking?
              </Text>
              <Text className="text-center text-lg opacity-70" style={{ fontFamily: 'DMSans_400Regular' }}>
                This helps us tailor a meaningful Bible journey for you.
              </Text>
            </View>

            {/* Progress Bar with Bōōns avatar */}
            <View className="h-2 bg-white/20 rounded-full mb-12 overflow-hidden">
              <MotiView 
                className="h-full bg-[#F0C060] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring' }}
              />
            </View>

            <View className="flex-1 justify-center gap-4">
              {quizOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSeeking(option.label);
                  }}
                  className={`p-6 rounded-3xl border-2 flex-row items-center gap-4 ${selectedSeeking === option.label ? 'border-[#F0C060] bg-white/10' : 'border-white/20'}`}
                >
                  <View className="text-4xl w-12">{option.emoji}</View>
                  <Text className="text-2xl flex-1 font-semibold text-white" style={{ fontFamily: 'Nunito_600SemiBold' }}>
                    {option.label}
                  </Text>
                  {selectedSeeking === option.label && (
                    <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-[#F0C060] items-center justify-center">
                      <Text className="text-[#0D0D14] text-xl">✓</Text>
                    </MotiView>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              disabled={!selectedSeeking}
              className={`mt-8 py-5 rounded-3xl items-center ${!selectedSeeking ? 'bg-white/20' : 'bg-[#F97316]'}`}
            >
              <Text className={`text-xl font-semibold ${!selectedSeeking ? 'text-white/50' : 'text-white'}`} style={{ fontFamily: 'Nunito_700Bold' }}>
                CONTINUE
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2: // Age / Background
        return (
          <View className="flex-1 px-6 pt-12" style={{ backgroundColor: '#F59E0B' }}>
            <Text className="text-5xl font-bold text-center mb-2 text-white tracking-tighter" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
              What's your age?
            </Text>
            <Text className="text-center text-white/90 text-lg mb-12" style={{ fontFamily: 'DMSans_400Regular' }}>
              This helps us tailor a meaningful Bible journey for you.
            </Text>

            {/* Drum roll style picker - simplified to horizontal scroll for demo */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-12"
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {ageOptions.map((age) => (
                <TouchableOpacity
                  key={age}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAge(age);
                  }}
                  className={`w-20 h-20 mx-2 rounded-3xl items-center justify-center border-4 transition-all ${selectedAge === age ? 'border-white bg-white scale-110' : 'border-white/30 bg-white/10'}`}
                >
                  <Text 
                    className={`text-4xl font-bold ${selectedAge === age ? 'text-[#F59E0B]' : 'text-white'}`}
                    style={{ fontFamily: 'Nunito_700Bold' }}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedAge && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
              >
                <Text className="text-center text-white text-xl mb-8" style={{ fontFamily: 'Nunito_600SemiBold' }}>
                  Perfect! Curating your personalized path...
                </Text>
              </MotiView>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={!selectedAge}
              className={`py-6 rounded-3xl items-center ${!selectedAge ? 'bg-white/30' : 'bg-white'}`}
              style={{ marginTop: 'auto', marginBottom: 40 }}
            >
              <Text className={`text-2xl font-bold ${!selectedAge ? 'text-white/60' : 'text-[#F59E0B]'}`} style={{ fontFamily: 'Nunito_700Bold' }}>
                CONTINUE
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#1A0A2E' }}>
        <MotiView
          animate={{ rotate: 360 }}
          transition={{ type: 'timing', duration: 1200, loop: true }}
        >
          <Text style={{ fontSize: 80 }}>🦁</Text>
        </MotiView>
        <Text className="text-white text-2xl mt-8 font-medium" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
          Curating your 7-day peace plan...
        </Text>
        <Text className="text-white/60 mt-4">Bōōns is preparing your adventure</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: step === 0 || step === 1 ? '#1A0A2E' : '#F59E0B' }}>
      {/* Top Progress Indicator */}
      <View className="pt-12 px-8">
        <View className="flex-row justify-between mb-2">
          {[0, 1, 2].map((i) => (
            <View key={i} className={`h-1.5 flex-1 mx-1 rounded-full ${i <= step ? 'bg-[#F0C060]' : 'bg-white/20'}`} />
          ))}
        </View>
      </View>

      {renderStep()}
    </View>
  );
}
