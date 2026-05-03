import React from 'react';
import { View, Text, Animated } from 'react-native';
import { MotiView } from 'moti';

// Reusable animated Bōōns the Lion mascot
// Breathing idle, celebrate on streak, sad on broken streak
export const LionMascot = ({ 
  size = 120, 
  mood = 'happy' as 'happy' | 'celebrating' | 'thinking' | 'sad',
  animated = true 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (animated && mood === 'celebrating') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.95, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else if (animated) {
      // Gentle breathing
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.98, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
    return () => {
      scaleAnim.stopAnimation();
    };
  }, [mood, animated]);

  const getEmoji = () => {
    switch (mood) {
      case 'celebrating': return '🎉🦁';
      case 'sad': return '😢🦁';
      case 'thinking': return '🤔🦁';
      default: return '🦁';
    }
  };

  return (
    <MotiView
      animate={{
        scale: mood === 'celebrating' ? [1, 1.2, 1] : [1, 1.03, 1],
        rotate: mood === 'celebrating' ? ['-8deg', '8deg', '-8deg'] : '0deg',
      }}
      transition={{
        type: 'spring',
        duration: mood === 'celebrating' ? 800 : 2000,
        loop: true,
      }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text style={{ fontSize: size * 0.85 }}>{getEmoji()}</Text>
      </Animated.View>
      {mood === 'celebrating' && (
        <MotiView
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300 }}
          style={{ position: 'absolute', top: -20, right: -20 }}
        >
          <Text style={{ fontSize: 32 }}>✨</Text>
        </MotiView>
      )}
    </MotiView>
  );
};

export default LionMascot;
