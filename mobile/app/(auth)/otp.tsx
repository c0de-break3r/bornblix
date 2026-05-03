import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useBornblixTheme } from '../../src/lib/themes';

export default function OTPScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const { theme } = useBornblixTheme('journal');
  const [timer, setTimer] = useState(45);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If complete, auto verify
    if (index === 5 && text) {
      verifyCode(newCode.join(''));
    }
  };

  const verifyCode = async (fullCode: string) => {
    if (fullCode.length !== 6) return;
    
    setIsVerifying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      // On success, go to main app
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimer(45);
    // In real app, trigger resend via Clerk
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding">
      <View className="flex-1 px-8 pt-16">
        <TouchableOpacity onPress={() => router.back()} className="self-start mb-8">
          <Text className="text-[#F59E0B] text-lg font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'PlayfairDisplay_700Bold', color: '#111' }}>
          Verify your email
        </Text>
        <Text className="text-center text-gray-600 mb-12 text-lg" style={{ fontFamily: 'DMSans_400Regular' }}>
          We sent a code to{'\n'}
          <Text className="font-semibold">{email || 'your@email.com'}</Text>
        </Text>

        {/* 6 Digit OTP Inputs */}
        <View className="flex-row justify-center gap-3 mb-12">
          {code.map((digit, index) => (
            <MotiView
              key={index}
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 80 }}
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-16 text-center text-4xl font-bold border-2 rounded-2xl bg-gray-50"
                style={{ 
                  borderColor: digit ? '#F59E0B' : '#E5E5E5',
                  color: '#111',
                  fontFamily: 'Nunito_700Bold'
                }}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
              />
            </MotiView>
          ))}
        </View>

        {isVerifying && (
          <MotiView className="items-center mb-8">
            <Text className="text-[#F59E0B] text-lg font-medium">Verifying your code...</Text>
          </MotiView>
        )}

        {/* Resend */}
        <View className="items-center">
          <TouchableOpacity 
            onPress={handleResend} 
            disabled={timer > 0}
            className="flex-row items-center"
          >
            <Text className="text-gray-500 text-base" style={{ fontFamily: 'DMSans_400Regular' }}>
              Didn't receive it?{' '}
              <Text className={`${timer > 0 ? 'text-gray-400' : 'text-[#F59E0B] font-semibold'}`}>
                Resend {timer > 0 ? `(${timer}s)` : ''}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto mb-12">
          <Text className="text-center text-xs text-gray-400" style={{ fontFamily: 'DMSans_400Regular' }}>
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
