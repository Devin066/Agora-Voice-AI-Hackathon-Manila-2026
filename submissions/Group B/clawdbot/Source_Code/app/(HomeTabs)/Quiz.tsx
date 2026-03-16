import {
  View,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useRef, useContext, useEffect } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useGeminiQuiz } from "@/hooks/useGeminiQuiz";
import useDocument from "@/hooks/useDocumentPicker";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { useRouter } from "expo-router";
import { QuizContext } from "@/context/QuizContext";
import { storage } from "@/lib/MMKVConfig";
import CustomModal from "@/components/CustomModal";
import usePDFConverter from "@/hooks/usePDFConvert";
import { CREATING_QUIZ_TASK } from "@/lib/helperFuntions/backgroundFetch";
import CustomLoader from "@/components/CustomLoader"
import {startForegroundService, stopForegroundService, ShowNotification} from "@/lib/helperFuntions/foregroundUtils"

export default function Quiz() {
  const { getPDFText } = usePDFConverter();
  const router = useRouter();
  const [typeTask, setTypeTask] = useState<string>("")
  const context = useContext(QuizContext);
  const [count, setCount] = useState(10);
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState<string>("Balanced");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProccessing, setIsProccessing]  = useState<boolean>(false)
  const [isExtracting, setIsExtracting] = useState(false);

  const { PickDocument, document, setDocument } = useDocument();
  const { generateQuiz, isLoading } = useGeminiQuiz();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const mode = document ? "pdf" : "text";

  useEffect(() => {
    return () => setText("")
  }, [])

  const handleForegroundGen = async () => {
    setIsModalVisible(false);
    setIsProccessing(true)
    if (!text) return;
    
    try {
      const quiz = await generateQuiz(text, count, difficulty);
      const quizString =  JSON.stringify(quiz)
      if (context) context.setQuiz(quizString);
      setIsProccessing(false)
      setDocument(null)
      router.push("/(RedirectPath)/Reviewer");
    } catch (error) {

      Alert.alert("Error", "Failed to generate quiz.");
      setIsProccessing(false)
    }
  };


  const handleBackgroundGen = async () => {
  setIsModalVisible(false)

  try {
    await startForegroundService(
      "Creating Quiz",
      "Your quiz is being generated..."
    )

    const quiz = await generateQuiz(text, count, difficulty)
    const quizString = JSON.stringify(quiz)

    if (context) context.setQuiz(quizString)

    await ShowNotification()
    await stopForegroundService()

    router.push("/(RedirectPath)/Reviewer")
  } catch (err) {
    await stopForegroundService()
    Alert.alert("Error", "Failed to generate quiz.")
  }
}
  const handleCreateQuiz = async () => {
    
    let allow =  storage.getString("gemini_api_key")
    
    // add a conversion for document to text in there later 
    // addd more safe Guard
    // add the foreground services
    // add an error here latter
    if (!allow) {
      Alert.alert("Error", "Failed to Extract No API key Stored.");
      return null
    } 
    
    if (mode === "text" && (!text || text.trim().length < 5)) {
      Alert.alert("Input Required", "Please provide more text.");
      return;
    }

    setIsExtracting(true);

    try {
      let finalContent = "";

      if (mode === "pdf" && document) {
        const result = await getPDFText(document.uri);
        
        if (!result) {
          throw new Error("EMPTY_OR_SHORT");
        }
        finalContent = result;
      } else {
        finalContent = text;
      }

      setText(finalContent);
      setIsExtracting(false);
      setIsModalVisible(true);

    } catch (err) {
      setIsExtracting(false);
      Alert.alert("Extraction Error", "The PDF appears to be empty or unreadable.");
    }
  };

  return (
    <View className="flex-1 relatieve bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>
          <View className="mb-8">
            <Text className="text-neutral-400 text-base font-medium">Study Mode</Text>
            <Text className="text-neutral-900 text-4xl font-bold tracking-tighter">AI Reviewer</Text>
          </View>

          <TouchableOpacity
            className={`w-full relative border-2 border-dashed rounded-[32px] p-10 items-center justify-center ${
              document ? "border-green-500 bg-green-50" : "border-neutral-200 bg-neutral-50"
            }`}
            onPress={PickDocument}
          >
            {document && (
              <Pressable className="absolute -top-2 -right-2" onPress={() => setDocument(null)}>
                <Feather name="x-circle" size={24} color="#000" />
              </Pressable>
            )}
            <View className={`p-4 rounded-full shadow-sm mb-4 ${document ? "bg-green-100" : "bg-white"}`}>
              <Feather name={document ? "file-text" : "upload-cloud"} size={24} color={document ? "#16a34a" : "black"} />
            </View>
            <Text className="text-neutral-900 font-bold text-lg">{document ? document.name : "Upload Document"}</Text>
          </TouchableOpacity>

          {!document && (
            <>
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-[1px] bg-neutral-100" />
                <Text className="mx-4 text-neutral-300 font-bold text-xs uppercase tracking-widest">Or paste text</Text>
                <View className="flex-1 h-[1px] bg-neutral-100" />
              </View>
              <View className="bg-neutral-50 rounded-3xl p-4 border border-neutral-100">
                <TextInput
                  multiline
                  placeholder="Paste notes here..."
                  placeholderTextColor="#A3A3A3"
                  value={text}
                  onChangeText={setText}
                  className="text-neutral-900 h-32 align-top text-base"
                />
              </View>
            </>
          )}

          <View className="mt-10 flex-row gap-x-2">
            <TouchableOpacity
              onPress={handleCreateQuiz}
              disabled={isLoading || isExtracting}
              className={`flex-1 flex-row justify-center py-4 rounded-2xl items-center ${
                isLoading || isExtracting ? "bg-neutral-400" : "bg-neutral-900"
              }`}
            >
              {isLoading || isExtracting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Generate Quiz</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => bottomSheetRef.current?.expand()} 
              className="px-5 border border-neutral-200 rounded-2xl justify-center bg-white"
            >
              <Ionicons name="options-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {
        isProccessing ? <View className="absolute top-0 w-full h-full"> <CustomLoader /> </View> : null 
      }

      <CustomModal 
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        title="Choose Mode"
        body="Would you like to wait or handle this in the background?"
        buttonTitle1="Wait Here"
        buttonTitle2="Background"
        onPress1={handleForegroundGen}
        onPress2={handleBackgroundGen}
      />

      <CustomBottomSheet 
        bottomSheetRef={bottomSheetRef} 
        count={count} 
        setCount={setCount} 
        difficulty={difficulty} 
        setDifficulty={setDifficulty} 
      />
    </View>
  );
}