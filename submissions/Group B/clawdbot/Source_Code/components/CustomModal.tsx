import React from "react";
import { View, Modal, Text, Pressable } from "react-native";

import {Feather} from "@expo/vector-icons"

interface CustomModalInterface {
  title: string;
  body: string;
  buttonTitle1?: string;
  buttonTitle2?: string;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onPress1?: () => void;
  onPress2?: () => void;
}

const CustomModal = ({
  title,
  setVisible,
  visible,
  body,
  buttonTitle1,
  buttonTitle2,
  onPress1,
  onPress2,
}: CustomModalInterface) =>  {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 relative justify-center items-center bg-black/50 px-6">
       <View className="bg-white w-full rounded-[32px] p-6 shadow-xl">
  <Pressable onPress={ () => setVisible(false)} className="absolute top-5 right-5">
        <Feather name="x-circle" color="#000" size={26} />
      </Pressable>
       
          <Text className="font-bold text-2xl text-neutral-900 mb-2">{title}</Text>
          <Text className="text-neutral-500 text-base mb-8 leading-6">{body}</Text>
          <View className="flex-row gap-x-3">
            {buttonTitle2 && (
              <Pressable 
                onPress={onPress2}
                className="flex-1 bg-neutral-100 py-4 rounded-2xl items-center"
              >
                <Text className="text-neutral-900 font-bold text-base">{buttonTitle2}</Text>
              </Pressable>
            )}
            
            {buttonTitle1 && (
              <Pressable 
                onPress={onPress1}
                className="flex-1 bg-neutral-900 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-base">{buttonTitle1}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default React.memo(CustomModal)