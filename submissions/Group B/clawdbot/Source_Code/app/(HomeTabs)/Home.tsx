import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import HomeCardComponent from "@/components/HomeCardComponent";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 60 }}
      >
        <TouchableOpacity 
          onPress={() => router.push("/(HomeTabs)/Settings")}
          activeOpacity={0.9}
          className="mb-8 bg-neutral-900 p-6 rounded-[32px] shadow-xl shadow-neutral-400"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="bg-white/20 p-2 rounded-xl">
              <Feather name="cpu" size={20} color="white" />
            </View>
            <Feather name="arrow-up-right" size={20} color="white" />
          </View>
          
          <Text className="text-white text-xl font-bold tracking-tight">
            Connect Gemini AI
          </Text>
          <Text className="text-white text-sm mt-2 leading-5">
            Link your Google API key to unlock automated quiz generation and smart document analysis.
          </Text>
          
          <View className="mt-6 py-2 px-4 bg-white/10 self-start rounded-full border border-white/10">
            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
              Setup Required
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="text-neutral-900 text-[10px] uppercase tracking-[2px] font-black mb-6">
          Intelligence Tools
        </Text>
        
        <View className="gap-y-4">
          <HomeCardComponent 
            Path="/(RedirectPath)/ImageToText"  
            Title="Image to Text" 
            BodyContent="Extract text from any document or image using local machine learning."
          />

          <HomeCardComponent 
            Path="/(HomeTabs)/Quiz"  
            Title="Quiz Architect" 
            BodyContent="Transform notes into structured study materials and practice tests."
          />
           <HomeCardComponent 
            Path="/(RedirectPath)/PDFText"  
            Title="PDF to Text" 
            BodyContent="Extract text from any PDF file."
          />
        </View>

        <View className="mt-12 p-6 bg-neutral-50 rounded-[32px] border border-neutral-100">
          <Text className="text-neutral-900 font-bold mb-2">Why do I need an API key?</Text>
          <Text className="text-neutral-500 text-xs leading-5">
            To keep this app free and private, we don't process your data on our own servers. 
            By using your own Gemini key, you get:
          </Text>
          <View className="mt-4 gap-y-2">
            <FeatureItem icon="shield" text="Complete data privacy" />
            <FeatureItem icon="zap" text="Faster processing speeds" />
            <FeatureItem icon="infinity" text="Higher usage limits" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={12} color="#737373" />
      <Text className="ml-2 text-neutral-500 text-[11px] font-medium">{text}</Text>
    </View>
  );
}
