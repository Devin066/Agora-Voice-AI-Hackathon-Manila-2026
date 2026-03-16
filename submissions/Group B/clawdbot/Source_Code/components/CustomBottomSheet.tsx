import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import CounterComponent from "@/components/CounterButton"
import CustomPressable from "./CustomPressable"
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View,  Text, Pressable  } from "react-native";

export default function CustomBottomSheet({ bottomSheetRef, count, setCount, difficulty, setDifficulty }: any) {
  const snapPoints = useMemo(() => ["50%"], []);
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);

  useEffect(() => {
    setLocalDifficulty(difficulty);
  }, [difficulty]);

  const levels = useMemo(() => ["Easy", "Balanced", "Hard"], []);

  const handleApply = useCallback(() => {
    setDifficulty(localDifficulty); 
    bottomSheetRef.current?.close();
  }, [localDifficulty, setDifficulty, bottomSheetRef]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop 
        {...props} 
        disappearsOnIndex={-1} 
        appearsOnIndex={0} 
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#D4D4D4", width: 40 }}
      backgroundStyle={{ borderRadius: 40 }}
    >
      <BottomSheetView style={{ padding: 32 }}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-neutral-900 tracking-tight">Configuration</Text>
          <Text className="text-neutral-400 text-sm">Tailor your quiz generation</Text>
        </View>

        <View className="flex-row items-center justify-between py-5 border-b border-neutral-50">
          <View className="flex-1 pr-4">
            <Text className="text-neutral-900 font-bold text-base">Question Limit</Text>
            <Text className="text-neutral-400 text-xs">Total questions to generate</Text>
          </View>
          <CounterComponent count={count} setCount={setCount} />
        </View>

        <View className="py-5">
          <Text className="text-neutral-900 font-bold text-base mb-3">Difficulty Level</Text>
                 <CustomPressable levels={levels} setLocalDifficulty={setLocalDifficulty} localDifficulty={localDifficulty} />
        </View>

        <Pressable 
          onPress={handleApply}
          className="mt-4 bg-neutral-900 w-full py-4 rounded-2xl items-center shadow-md"
        >
          <Text className="text-white font-bold">Apply Changes</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
