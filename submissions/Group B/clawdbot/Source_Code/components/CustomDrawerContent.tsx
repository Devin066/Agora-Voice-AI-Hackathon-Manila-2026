import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CustomDrawerContent(props: any) {
  const inset = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-black"> 
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <View 
          style={{ paddingTop: inset.top + 20 }} 
          className="px-6 pb-8 border-b border-neutral-800" 
        >
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-xl">
            <Feather name="zap" size={32} color="black" /> 
          </View>
          
          <Text className="text-2xl font-bold text-white tracking-tighter">
            Charmaine
          </Text>
          <Text className="text-neutral-400 text-xs font-medium uppercase tracking-widest">
            AI Study Partner
          </Text>
        </View>
      </DrawerContentScrollView>

      <View 
        style={{ paddingBottom: inset.bottom + 20 }} 
        className="px-8 flex-row items-center justify-between"
      >
        <View>
          <Text className="text-white font-bold">Pro Plan</Text> 
          <Text className="text-neutral-500 text-[10px] uppercase">v 1.0.0</Text>
        </View>
        
        <TouchableOpacity className="w-10 h-10 bg-neutral-800 rounded-full items-center justify-center">
          <Feather name="log-out" size={18} color="white" /> 
        </TouchableOpacity>
      </View>
    </View>
  );
}