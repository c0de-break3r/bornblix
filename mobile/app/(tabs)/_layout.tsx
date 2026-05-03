import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useBornblixTheme } from '../../src/lib/themes';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom Glassmorphism Tab Bar Component matching the reference navber.jpeg
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useBornblixTheme();
  const insets = useSafeAreaInsets();

  const icons = [
    { name: 'chatbubble-ellipses', label: 'Chat', route: 'chat' },
    { name: 'book', label: 'Bible', route: 'bible' },
    { name: 'sunny', label: 'Today', route: 'today' },
    { name: 'map', label: 'Quest', route: 'quest' },
    { name: 'person', label: 'Profile', route: 'profile' },
  ];

  return (
    <BlurView 
      intensity={90} 
      tint="dark"
      className="absolute bottom-0 left-0 right-0 flex-row border-t border-white/10"
      style={{ 
        paddingBottom: insets.bottom || 12,
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.glassmorphism.background,
        borderTopColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const icon = icons[index] || { name: 'help', label: route.name, route: route.name };
        
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className="flex-1 items-center justify-center py-2"
            style={{ paddingTop: 8 }}
          >
            <MotiView
              animate={{ 
                scale: isFocused ? 1.15 : 1,
                translateY: isFocused ? -4 : 0 
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Ionicons 
                name={icon.name as any} 
                size={26} 
                color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} 
              />
            </MotiView>
            <Text 
              className={`text-[10px] mt-1 font-medium tracking-wider ${isFocused ? 'text-white' : 'text-white/50'}`}
              style={{ fontFamily: 'DMSans_400Regular' }}
            >
              {icon.label}
            </Text>
            {isFocused && (
              <View className="w-1.5 h-1.5 mt-1.5 bg-[#F0C060] rounded-full" />
            )}
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

export default function TabLayout() {
  const { theme } = useBornblixTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
        },
        tabBarBackground: () => null, // Handled by custom
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          title: 'Quest',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
