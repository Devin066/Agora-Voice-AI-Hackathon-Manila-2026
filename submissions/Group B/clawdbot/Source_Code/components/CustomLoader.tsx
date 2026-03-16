import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function LoadingSpinner({ message = "Loading..." }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center justify-center">
        <Animated.View
          style={{ transform: [{ rotate }] }}
          className="w-16 h-16 border-4 border-neutral-100 border-t-neutral-900 rounded-full"
        />
        
        <View className="absolute">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Feather name="layers" size={20} color="#171717" />
          </Animated.View>
        </View>
      </View>

      <View className="mt-8 items-center">
        <Text className="text-neutral-900 font-bold text-lg tracking-tight">
          {message}
        </Text>
        <Text className="text-neutral-400 text-xs font-black uppercase tracking-[3px] mt-1">
          Processing On-Device
        </Text>
      </View>
    </View>
  );
}