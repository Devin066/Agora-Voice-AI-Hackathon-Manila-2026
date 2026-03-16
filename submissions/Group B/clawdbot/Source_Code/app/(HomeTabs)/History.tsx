import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useState, useEffect, useContext, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import { QuizContext } from "@/context/QuizContext";
import { useRouter } from "expo-router";
import { storage } from "@/lib/MMKVConfig";

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false)
  const context = useContext(QuizContext);
  const router = useRouter();
  
  const onRefresh = useCallback(  () => {
    setRefresh(true)
    loadHistory()
    setRefresh(false)
  }, [])

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const rawIds = storage.getString("quizId");
    const idArray: string[] = rawIds ? JSON.parse(rawIds) : [];

    const quizzes = idArray.map((id) => {
      const quizDataRaw = storage.getString(id);
      if (quizDataRaw) {
        return {
          id,
          rawString: quizDataRaw,
          ...JSON.parse(quizDataRaw),
        };
      }
      return null;
    }).filter(item => item !== null);

    setHistory(quizzes.reverse()); 
  };

  const handleRetake = (rawString: string) => {
    if (!context) return;
    
    context.setQuiz(rawString);
    
    router.push({
      pathname: "/(RedirectPath)/Reviewer",
    });
  };

  const deleteItem = (id: string) => {
    const rawIds = storage.getString("quizId");
    const idArray: string[] = rawIds ? JSON.parse(rawIds) : [];
    const updatedIds = idArray.filter(quizId => quizId !== id);
    storage.set("quizId", JSON.stringify(updatedIds));

    storage.remove(id);

    setHistory(prev => prev.filter(item => item.id !== id));
  };

  if (!context) return null;

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
      >
        <View className="mb-8">
          <Text className="text-neutral-400 text-base font-medium">Recents</Text>
          <Text className="text-neutral-900 text-4xl font-bold tracking-tighter">History</Text>
          <View className="mt-2 px-3 py-1 bg-neutral-100 self-start rounded-full">
            <Text className="text-[10px] font-bold text-neutral-500 uppercase">Your generated quizzes</Text>
          </View>
        </View>

        {history.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <Feather name="book-open" size={48} color="#D4D4D4" />
            <Text className="text-neutral-400 mt-4 text-center">No quizzes generated yet.</Text>
          </View>
        ) : (
          history.map((item) => (
            <View 
              key={item.id} 
              className="mb-4 p-5 rounded-3xl border border-neutral-100 bg-white shadow-sm flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className="text-neutral-900 font-bold text-lg mb-1" numberOfLines={1}>
                  {item.quiz_title || "Untitled Quiz"}
                </Text>
                <Text className="text-neutral-400 text-xs">
                  {item.questions?.length || 0} Questions
                </Text>
              </View>

              <View className="flex-row items-center gap-x-3 space-x-2">
                <TouchableOpacity 
                  onPress={() => handleRetake(item.rawString)}
                  className="bg-neutral-900 p-3 rounded-2xl"
                >
                  <Feather name="play" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => deleteItem(item.id)}
                  className="bg-neutral-50 p-3 rounded-2xl"
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView> 
    </View>
  );
}