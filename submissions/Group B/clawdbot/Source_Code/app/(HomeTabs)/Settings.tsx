import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import CustomModal from "@/components/CustomModal"
import { storage } from "@/lib/MMKVConfig"; 
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const [api, setApi] = useState("");

  const savedKey = storage.getString("gemini_api_key");
  useEffect(() => {
    if (!savedKey) return   
    setApi(savedKey)
  }, [savedKey]);

  const handleKeyChange = (text: string) => {
    setApiKey(text);
    storage.set("gemini_api_key", text);
  };

  const handleDeleteAPIKey = () => {
    storage.remove("gemini_api_key");
    Alert.alert("Remove API Key", "Deleted API Key from storage");
  }

  const handleDeleteAllQuiz = () => {
    storage.remove("quizId")
    Alert.alert("History cleared", "Deleted all Quizes from storage");
  }

  const testConnection = async () => {
    if (!savedKey) return Alert.alert("Error", "Please enter a key first.");
    
    setIsTesting(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("Hi");
      Alert.alert("Success", "API Key is valid and working!");
    } catch (error) {
      Alert.alert("Connection Failed", "Invalid API key or network error.");
    } finally {
      setIsTesting(false);
    }
    setApiKey("")
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-neutral-900 text-4xl font-bold tracking-tighter">Settings</Text>
        </View>

        <View className="mb-10">
          <Text className="text-neutral-900 text-xs font-extrabold uppercase tracking-widest mb-4 ml-1">
            AI Configuration
          </Text>
          <View className="bg-neutral-50 rounded-[32px] p-6 border border-neutral-100">
            <Text className="text-neutral-900 font-bold mb-2">Gemini API Key</Text>
            <View className="flex-row items-center bg-white border border-neutral-200 rounded-2xl px-4 py-1">
              <Feather name="key" size={16} color="#737373" />
              <TextInput
                className="flex-1 h-12 ml-3 text-neutral-900"
                placeholder="Enter your API Key..."
                placeholderTextColor="#A3A3A3"
                value={apiKey}
                onChangeText={handleKeyChange}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              onPress={testConnection}
              disabled={isTesting}
              className="mt-4 bg-neutral-900 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                {isTesting ? "Testing..." : "Test Connection"}
              </Text>
            </TouchableOpacity>

            <Text className="text-neutral-400 text-[11px] mt-3 leading-4 px-1">
              If left empty, the app will try to use the key from your .env file.
            </Text>
          </View>
        </View>

        <View className="mb-10">
          <Text className="text-neutral-900 text-xs font-extrabold uppercase tracking-widest mb-4 ml-1">
            Preferences
          </Text>
          <View className="flex flex-col gap-y-2">

          <View className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden">
            <TouchableOpacity 
              onPress={handleDeleteAPIKey}
              className="flex-row items-center justify-between p-5 active:bg-neutral-50"
            >
              <View className="flex-row items-center gap-x-4">
                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                  <Feather name="trash-2" size={18} color="black" />
                </View>
                <Text className="text-neutral-900 font-bold">Remove API Key</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#D4D4D4" />
            </TouchableOpacity>
          </View>
          <View className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden">
            <TouchableOpacity 
              onPress={handleDeleteAllQuiz }
            className="flex-row items-center justify-between p-5 active:bg-neutral-50"
            >
              <View className="flex-row items-center gap-x-4">
                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                  <Feather name="trash-2" size={18} color="black" />
                </View>
                <Text className="text-neutral-900 font-bold">Clear Quiz History</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#D4D4D4" />
            </TouchableOpacity>
          </View>
 
        </View>
          </View>
      </ScrollView>
    </View>
  );
}