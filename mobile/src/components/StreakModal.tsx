import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useGamificationStore } from '../store/gamificationStore';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ visible, onClose }) => {
  const { streak, incrementStreak } = useGamificationStore();

  const handleClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    incrementStreak();
    onClose();
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <BlurView intensity={30} className="absolute inset-0" />

      <MotiView
        from={{ opacity: 0, scale: 0.7, translateY: 100 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 120 }}
        className="w-[90%] max-w-[360px] bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header with flame and stars */}
        <View className="pt-10 pb-6 items-center relative" style={{ backgroundColor: '#EFF6FF' }}>
          {/* Star particles burst */}
          {Array.from({ length: 8 }).map((_, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0.2, translateX: (Math.random() - 0.5) * 80, translateY: -20 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0.2, 1.2, 0.8],
                translateX: (Math.random() - 0.5) * 120,
                translateY: -80 - Math.random() * 60 
              }}
              transition={{ 
                duration: 1800 + Math.random() * 600, 
                delay: i * 40 
              }}
              className="absolute text-2xl"
              style={{ 
                left: 30 + Math.random() * (width * 0.6), 
                top: 30 
              }}
            >
              ✨
            </MotiView>
          ))}

          <MotiView
            from={{ scale: 0.5, rotate: '-20deg' }}
            animate={{ scale: 1.1, rotate: '10deg' }}
            transition={{ type: 'spring', loop: true }}
            className="mb-4"
          >
            <Text style={{ fontSize: 72 }}>🔥</Text>
          </MotiView>

          <Text className="text-6xl font-bold text-blue-600" style={{ fontFamily: 'Nunito_700Bold' }}>
            {streak}
          </Text>
          <Text className="text-3xl font-semibold text-gray-800 -mt-2" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
            Daily Streak
          </Text>
          <Text className="text-blue-600/80 mt-1 text-center px-8 text-base" style={{ fontFamily: 'DMSans_400Regular' }}>
            Good job, keep on growing your faith and come back tomorrow
          </Text>
        </View>

        {/* Weekly Calendar in Modal */}
        <View className="px-8 py-8 bg-white">
          <View className="flex-row justify-between mb-8">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <View key={index} className="items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${index < 3 ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  {index < 3 ? (
                    <Text className="text-emerald-600 text-xl">✓</Text>
                  ) : (
                    <Text className="text-gray-400 text-xs">○</Text>
                  )}
                </View>
                <Text className="text-xs font-medium text-gray-500">{day}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-yellow-400 py-5 rounded-3xl items-center active:bg-amber-500"
            style={{ shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 }}
          >
            <Text className="text-[#0D0D14] text-xl font-bold tracking-wider" style={{ fontFamily: 'Nunito_700Bold' }}>
              I WILL COME BACK TOMORROW
            </Text>
          </TouchableOpacity>
        </View>

        {/* Close button */}
        <TouchableOpacity 
          onPress={onClose}
          className="absolute top-6 right-6 w-8 h-8 bg-white/80 rounded-full items-center justify-center border border-gray-200"
        >
          <Text className="text-xl text-gray-500">×</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};
