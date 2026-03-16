import { Text, View, TouchableOpacity, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";

interface IndexProps {
  onComplete: () => void;
}

export default function Index({ onComplete }: IndexProps) {
  return (
    <View className="flex-1 bg-white px-8 justify-between py-16">
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent />
      <View />
      
      <View className="items-center">
        <View className="w-20 h-20 bg-neutral-900 rounded-[24px] items-center justify-center mb-8 shadow-xl">
          <Feather name="layers" size={40} color="white" />
        </View>
        
        <Text className="text-neutral-900 text-4xl font-bold tracking-tighter text-center">
          Charmaine
        </Text>
        
        <Text className="text-neutral-400 text-center text-lg mt-4 leading-6 font-medium">
          Offline text extraction{"\n"}& intelligent study guides.
        </Text>
      </View>

      <View className="w-full gap-y-4">
        <TouchableOpacity 
          onPress={onComplete} 
          activeOpacity={0.8}
          className="bg-neutral-900 w-full py-5 rounded-[24px] flex-row justify-center items-center"
        >
          <Text className="text-white text-lg font-bold mr-2">Get Started</Text>
          <Feather name="arrow-right" size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-row justify-center items-center opacity-40">
          <Feather name="shield" size={12} color="black" />
          <Text className="text-[10px] font-bold uppercase tracking-widest ml-2">
            100% On-Device Processing
          </Text>
        </View>
      </View>
    </View>
  );
}
