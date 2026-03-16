import { useState, useMemo, useContext, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuizContext } from "@/context/QuizContext";

export default function Reviewer() {
  const router = useRouter();
  const inset = useSafeAreaInsets();
  const context = useContext(QuizContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!context) return null;
  const { Quiz } = context;

  const data = useMemo(() => {
    if (!Quiz) return null;
    try {
      const parsed = JSON.parse(Quiz);
      return (parsed && parsed.questions) ? parsed : null;
    } catch (e) {
      return null;
    }
  }, [Quiz]);

  useEffect(() => {
    if (data) {
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      setUserAnswer("");
      setShowFeedback(false);
    }
  }, [data]);

  if (!data) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <Feather name="alert-circle" size={48} color="#D4D4D4" />
        <Text className="text-neutral-400 text-center mt-4">No quiz data found.</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-6 bg-neutral-900 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View className="flex-1 bg-white px-8 items-center justify-center">
        <View className="w-24 h-24 bg-neutral-900 rounded-full items-center justify-center mb-6">
          <Feather name="award" size={48} color="white" />
        </View>
        <Text className="text-3xl font-bold text-neutral-900 text-center tracking-tighter">Quiz Complete!</Text>
        <Text className="text-neutral-400 text-lg mt-2 text-center">You scored {score} out of {data.questions.length}</Text>
        
        <View className="w-full gap-y-3 mt-10">
          <TouchableOpacity 
            onPress={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsFinished(false);
              setUserAnswer("");
              setShowFeedback(false);
            }}
            className="bg-neutral-100 w-full py-5 rounded-[24px] items-center"
          >
            <Text className="text-neutral-900 font-bold text-lg">Retake Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.replace("/(HomeTabs)/Home")}
            className="bg-neutral-900 w-full py-5 rounded-[24px] items-center shadow-lg shadow-black/20"
          >
            <Text className="text-white font-bold text-lg">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = data.questions[currentIndex];

  if (!currentQuestion) return null; 

  const progress = ((currentIndex + 1) / data.questions.length) * 100;

  const handleAnswer = (selected?: string) => {
    if (showFeedback) return;
    const finalAnswer = selected || userAnswer;
    if (!finalAnswer.trim()) return;

    const isCorrect = finalAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    if (isCorrect) setScore(prev => prev + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer("");
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      className="bg-white flex-1"
    >
      <View style={{ paddingTop: inset.top}} className="flex-1 px-6">
        <View className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-8 mt-4">
          <View style={{ width: `${progress}%` }} className="h-full bg-neutral-900" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, flexGrow : 1 }}>
          <Text className="text-neutral-400 text-xs font-black uppercase tracking-widest mb-2">
            Question {currentIndex + 1} of {data.questions.length}
          </Text>
          <Text className="text-neutral-900 text-2xl font-bold leading-8 mb-8">
            {currentQuestion.question}
          </Text>

          {currentQuestion.type === "multiple_choice" ? (
            <View className="gap-y-3">
              {currentQuestion.options?.map((option: string) => {
                const isThisAnswer = option === currentQuestion.answer;
                const isSelected = userAnswer === option;
                return (
                  <TouchableOpacity
                    key={option}
                    disabled={showFeedback}
                    onPress={() => {
                      setUserAnswer(option);
                      handleAnswer(option);
                    }}
                    className={`p-5 rounded-[24px] border-2 flex-row items-start justify-between ${
                      showFeedback && isThisAnswer ? 'border-green-500 bg-green-50' : 
                      showFeedback && isSelected && !isThisAnswer ? 'border-red-500 bg-red-50' :
                      isSelected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'
                    }`}
                  >
                    <Text className={`flex-1 font-medium mr-2 ${isSelected || (showFeedback && isThisAnswer) ? 'text-neutral-900' : 'text-neutral-500'}`}>
                      {option}
                    </Text>
                    {showFeedback && isThisAnswer && <Feather name="check-circle" size={18} color="#22c55e" />}
                    {showFeedback && isSelected && !isThisAnswer && <Feather name="x-circle" size={18} color="#ef4444" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View>
              <TextInput
                editable={!showFeedback}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type your answer here..."
                placeholderTextColor="#A3A3A3"
                returnKeyType="done"
                onSubmitEditing={() => handleAnswer()} 
                className={`border-2 p-5 rounded-[24px] text-lg font-bold ${
                  showFeedback ? (userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-neutral-100 bg-neutral-50'
                }`}
              />
              {showFeedback && (
                <View className="mt-4 p-5 bg-neutral-900 rounded-[24px]">
                  <Text className="text-neutral-400 text-[10px] uppercase font-black tracking-widest mb-1">Correct Answer</Text>
                  <Text className="text-white text-lg font-bold">{currentQuestion.answer}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={{ paddingBottom: inset.bottom + 20 }} className="pt-4">
          {!showFeedback ? (
            <TouchableOpacity 
              disabled={!userAnswer.trim()}
              onPress={() => handleAnswer()}
              className={`h-16 rounded-[24px] items-center justify-center ${userAnswer.trim() ? 'bg-neutral-900' : 'bg-neutral-200'}`}
            >
              <Text className="text-white font-bold text-lg">Check Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleNext}
              className="bg-neutral-900 h-16 rounded-[24px] items-center justify-center flex-row"
            >
              <Text className="text-white font-bold text-lg mr-2">
                {currentIndex === data.questions.length - 1 ? "Finish" : "Next Question"}
              </Text>
              <Feather name="arrow-right" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}