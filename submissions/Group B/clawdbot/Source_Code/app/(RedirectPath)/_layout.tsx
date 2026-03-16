import { useState, useContext } from "react";
import { Modal, View, Pressable, Text, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import {QuizContext} from "@/context/QuizContext"
import {ImageContext} from "@/context/ImageContext"
import {usePathname} from "expo-router"

import { Feather, MaterialIcons } from "@expo/vector-icons";

export default function HomeTabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const context = useContext(QuizContext)
  const ImageContexts = useContext(ImageContext)
  const pathname = usePathname()


  if (!ImageContexts) return
  if (!context) return 
  const {setQuiz} = context

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTitle: "",
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => {
              router.replace("/Home")
              ImageContexts.setImageListURI([])
              setQuiz("")  
            }} 
            style={{ marginLeft: 10 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" color="#fff" size={24} />
          </TouchableOpacity>
        ),
        headerRight: () => pathname === "/Reviewer" ? (
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)} 
            style={{ marginRight: 10 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="more-horizontal" color="#fff" size={24} />
          </TouchableOpacity>
        ) : null,
        headerTitleAlign: "center",
      }} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View className="flex-1">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View className="flex-1 bg-black/40" />
          </TouchableWithoutFeedback>
          
          <View className="bg-white rounded-t-[28px] px-6 pb-12 pt-4 shadow-2xl">
            <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-8" />
            
            <Text className="text-neutral-400 text-[11px] font-bold uppercase tracking-[2px] mb-6 ml-1">
              Quiz Options
            </Text>

            <TouchableOpacity 
              onPress={() => {
                setMenuVisible(false);
                router.replace("/(RedirectPath)/Reviewer"); 
              }}
              className="flex-row items-center py-4 mb-2 active:bg-neutral-50 rounded-2xl"
            >
              <View className="w-12 h-12 items-center justify-center bg-neutral-100 rounded-full mr-4">
                <MaterialIcons name="refresh" size={24} color="#171717" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-neutral-900">Restart</Text>
                <Text className="text-neutral-400 text-sm">Clear progress and start over</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setMenuVisible(false)}
              className="flex-row items-center py-4 active:bg-neutral-50 rounded-2xl"
            >
              <View className="w-12 h-12 items-center justify-center bg-neutral-100 rounded-full mr-4">
                <MaterialIcons name="edit" size={22} color="#171717" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-neutral-900">Modify Quiz</Text>
                <Text className="text-neutral-400 text-sm">Edit questions or title</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View> </Modal>
    </View>
  ) ;
}