import { View, TextInput, Pressable, Text } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

interface CounterButtonProps {
  count: number;
  setCount: (value: number) => void;
}

export default function CounterButton({ count, setCount }: CounterButtonProps) {
  const increment = () => setCount(count + 1);
  const decrement = () => {
    if (count > 1) setCount(count - 1);
  };

  const handleInputChange = (text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numericValue)) {
      setCount(numericValue);
    } else if (text === "") {
      setCount(0);
    }
  };

  const handleBlur = () => {
    if (count < 1) setCount(1);
    if (count > 50) setCount(50); 
  };

  return (
    <View className="flex-row items-center bg-neutral-100 rounded-[20px] p-1 self-start border border-neutral-200">
      <Pressable 
        onPress={decrement}
        className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm active:bg-neutral-50"
      >
        <Feather name="minus" size={16} color={count <= 1 ? "#D4D4D4" : "black"} />
      </Pressable>

      <View className="px-4 items-center justify-center min-w-[80px]">
        <TextInput
          className="text-neutral-900 font-bold text-lg text-center p-0 m-0"
          keyboardType="number-pad"
          value={count.toString()}
          onChangeText={handleInputChange}
          onBlur={handleBlur}
          maxLength={2}
          returnKeyType="done"
        />
        <Text className="text-neutral-400 text-[8px] font-black uppercase tracking-tighter -mt-1">
          Questions
        </Text>
      </View>

      <Pressable 
        onPress={increment}
        className="w-10 h-10 items-center justify-center bg-neutral-900 rounded-full active:opacity-80"
      >
        <Feather name="plus" size={16} color="white" />
      </Pressable>
    </View>
  );
}