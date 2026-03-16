import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, View, Text } from "react-native";
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { storage } from "@/lib/MMKVConfig";
import QuizContextProvider from "@/context/QuizContext";
import { RecognizeTextProvider } from "@/context/RecognizeTextContext";
import ImageContextProvider from "@/context/ImageContext";
import CustomDrawerContent from "@/components/CustomDrawerContent"; 
import CustomLoader from "@/components/CustomLoader"
import ExtractedPDFTextProvider from "@/context/ExtractedPDFContext"
import Onboarding from "../components/obBoarding"; 
import * as Notification from "expo-notifications"
import "@/lib/helperFuntions/backgroundFetch"
import "../globals.css";

export default function RootLayout() {

  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    const hasOpened = storage.getBoolean("hasOpened");
    const firstOpenValue = hasOpened === undefined ? true : !hasOpened;
    setIsFirstTime(firstOpenValue);

 }, []);

  const handleFinishOnboarding = () => {
    storage.set("hasOpened", true);
    setIsFirstTime(false);
  };

  if (isFirstTime === null) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <StatusBar barStyle="dark-content" />
        <CustomLoader />
      </View>
    );
  }

  if (isFirstTime) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Onboarding onComplete={handleFinishOnboarding} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ExtractedPDFTextProvider>

        <ImageContextProvider>
          <RecognizeTextProvider>
            <QuizContextProvider>
              <StatusBar key="app-status" barStyle="dark-content" backgroundColor="white" translucent />
              
              <Drawer 
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{ 
                  headerShown: false,
                  drawerType: 'slide',  
                  drawerStyle: { width: '75%', backgroundColor: 'white' },
                  overlayColor: 'rgba(0,0,0,0.6)',
                }} 
              >
                <Drawer.Screen 
                  name="index" 
                  options={{ drawerItemStyle: { display: 'none' } }} 
                />

                <Drawer.Screen 
                  name="(tabs)" 
                  options={{ drawerLabel: "Home" }} 
                />

                <Drawer.Screen 
                  name="(other-stack)" 
                  options={{ 
                    drawerItemStyle: { display: 'none' },
                  }} 
                />
              </Drawer>

            </QuizContextProvider>
          </RecognizeTextProvider>
        </ImageContextProvider>
        </ExtractedPDFTextProvider>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}