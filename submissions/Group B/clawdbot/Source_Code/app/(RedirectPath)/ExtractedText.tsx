import { useEffect, useRef, useState, useContext } from "react"
import { View, TextInput, ScrollView, Pressable, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native"
import CustomPressable from "@/components/CustomPressable"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Feather } from "@expo/vector-icons"

import { ImageContext } from "@/context/ImageContext"
import { RecognizeTextContext } from "@/context/RecognizeTextContext"
import { QuizContext } from "@/context/QuizContext"
import useImageRecognition from "@/hooks/useImageRecognition"
import CopyText from "@/components/CopyText"
import ClearTextComponent from "@/components/ClearTextComponent"
import CounterButton from "@/components/CounterButton"
import {ExtractedPDFContext} from "@/context/ExtractedPDFContext"
import { useGeminiQuiz } from "@/hooks/useGeminiQuiz" 

export default function ExtractedText() {
  const inset = useSafeAreaInsets()
  const router = useRouter()
  const [count, setCount] = useState<number>(20)
  const [difficulty, setDifficulty] = useState<string>("Balanced")
  
  const imageContext = useContext(ImageContext)
  const recognizeContext = useContext(RecognizeTextContext)
  const quizContext = useContext(QuizContext)
  const ExtractedPDFTextContext = useContext(ExtractedPDFContext)
  
  const { generateQuiz, isLoading: isGenerating } = useGeminiQuiz()

  if (!imageContext || !recognizeContext || !quizContext || !ExtractedPDFTextContext) return null


  const {text} = ExtractedPDFTextContext
  const { ImageListURI } = imageContext
  const { text: ocrText, Recognize } = useImageRecognition()
  const { SetText } = recognizeContext

  const [displayedText, setDisplayedText] = useState("")
  const scrollRef = useRef<ScrollView>(null)
  const isUserEditingRef = useRef(false)
  const processedUris = useRef<Set<string>>(new Set())

  const Levels = ["Easy", "Balanced", "Hard"]

  useEffect(() => {

    if (text) {
     setDisplayedText(prev => {
        const updated = prev ? `${prev}\n\n${text}` : text 
        SetText(updated) 
        return updated
    })
    }


    if (!ImageListURI.length) return
    let cancelled = false
    const runOCR = async () => {
      for (const uri of ImageListURI) {
        if (cancelled) return
        if (!processedUris.current.has(uri)) {
          await Recognize(uri)
          processedUris.current.add(uri)
        }
      }
    }
    if(!text) {
      runOCR()
    }
    return () => { cancelled = true
      setDisplayedText("")
     }
  }, [ImageListURI])

  useEffect(() => {
    if (ImageListURI) {
    if (!ocrText || isUserEditingRef.current) return
    const cleanedText = ocrText.replace(/\u200B/g, "").replace(/[^\S\r\n]+/g, " ").trim()
    setDisplayedText(prev => {
        const updated = prev ? `${prev}\n\n${cleanedText}` : cleanedText
        SetText(updated) 
        return updated
    }) 
    }
  }, [ocrText])

  const handleCreateQuiz = async () => {
    if (!displayedText || displayedText.length < 20) {
      Alert.alert("Empty Content", "Please extract or type some text before creating a quiz.")
      return
    }

    try {
      const quiz = await generateQuiz(displayedText, count, difficulty)
      quizContext.setQuiz(JSON.stringify(quiz))
      router.push("/(RedirectPath)/Reviewer")
    } catch (error: any) {
      if (error.message === "MISSING_API_KEY") {
        Alert.alert("Setup Required", "Please add your API Key in Settings.")
      } else {
        Alert.alert("Generation Failed", "Gemini could not process this text. Check your connection.")
      }
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-white"
    >
      <View  className="px-6 pt-3 pb-4 flex-row justify-between items-center border-b border-neutral-50">
        <View className="flex-row gap-x-2">
          <CopyText textToCopy={displayedText} />
          <ClearTextComponent text={displayedText} setText={setDisplayedText} />
        </View>
        <Text className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest">
          {displayedText.split(/\s+/).filter(Boolean).length} Words
        </Text>
      </View>

      <ScrollView 
        ref={scrollRef}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 280 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-neutral-400 text-[10px] font-black uppercase tracking-[2px] mb-1">
            Editor
          </Text>
          <Text className="text-neutral-900 text-3xl font-bold tracking-tight">
            Review Text
          </Text>
        </View>

        <View className="bg-neutral-50 rounded-[32px] p-6 border border-neutral-100 min-h-[400px]">
          <TextInput
            value={displayedText}
            onChangeText={(value) => {
              isUserEditingRef.current = true
              setDisplayedText(value)
              SetText(value)
            }}
            multiline
            placeholder="Scanning documents..."
            placeholderTextColor="#A3A3A3"
            textAlignVertical="top"
            className="text-neutral-800 text-base leading-6"
            scrollEnabled={false} 
          />
        </View>
      </ScrollView>

      <View 
        className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-4 border-t border-neutral-100 shadow-2xl"
        style={{ paddingBottom: inset.bottom + 20 }}
      >
        <View className="mb-4">
          <Text className="text-neutral-900 font-bold mb-2">Difficulty</Text>
          <CustomPressable levels={Levels} setLocalDifficulty={setDifficulty} localDifficulty={difficulty}/>
          
        </View>

        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-neutral-900 font-bold">Quiz Depth</Text>
            <Text className="text-neutral-400 text-xs">How many questions?</Text>
          </View>
          <CounterButton count={count} setCount={setCount} />
        </View>

        <View className="flex-row gap-x-3">
          <Pressable 
            disabled={isGenerating}
            onPress={() => router.push("/(RedirectPath)/ImageToText")} 
            className="w-14 h-14 bg-neutral-100 rounded-2xl items-center justify-center active:bg-neutral-200"
          >
            <Feather name="plus" size={22} color="black" />
          </Pressable>

          <Pressable 
            disabled={isGenerating}
            onPress={handleCreateQuiz} 
            className={`flex-1 h-14 ${isGenerating ? 'bg-neutral-400' : 'bg-neutral-900'} rounded-2xl items-center justify-center flex-row shadow-sm`}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">Generate Quiz</Text>
                <Feather name="zap" size={18} color="white" />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
