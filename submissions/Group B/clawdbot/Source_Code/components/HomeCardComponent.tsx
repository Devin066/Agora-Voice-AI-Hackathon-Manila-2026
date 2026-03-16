import { View, Text, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Href, useRouter } from "expo-router"

interface HomeCardComponentProps {
    Title: string
    BodyContent: string
    Path: Href 
}

export default function HomeCardComponent({ Title, BodyContent, Path }: HomeCardComponentProps) {
    const router = useRouter()
    return (
        <View className="w-full flex flex-col justify-between bg-white border border-neutral-200 p-6 rounded-3xl mb-2">
            <View className="flex-col gap-y-2">
                <Text style={{ fontFamily: "Roboto_700Bold" }} className="text-xl text-neutral-900">
                    {Title}
                </Text>
                <Text className="text-sm text-neutral-500 leading-5">
                    {BodyContent}
                </Text>
            </View>
            
            <Pressable 
                className="mt-6 py-4 bg-neutral-900 rounded-2xl flex-row items-center justify-center gap-x-2 active:opacity-80" 
                onPress={() => router.push(Path)}
            >
                <Text className="text-white font-semibold text-sm">
                    Get Started
                </Text> 
                <Feather name="arrow-up-right" size={16} color="white" />
            </Pressable> 
        </View> 
    )
}
