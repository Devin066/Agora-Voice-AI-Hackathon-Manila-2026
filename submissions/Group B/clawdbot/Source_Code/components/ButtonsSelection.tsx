import { View, Text, Pressable, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useContext } from "react"
import { ImageContext } from "@/context/ImageContext"
import useImageRecognize from "@/hooks/useImageRecognition"
import { Feather } from "@expo/vector-icons"

export default function ButtonSelection() {
    const { setText } = useImageRecognize()
    const router = useRouter()
    const context = useContext(ImageContext)
    
    if (!context) return null
    const { ImageListURI, setImageListURI } = context

    const handleExtracttext = () => {
        if (ImageListURI.length <= 0) {
            Alert.alert("Queue Empty", "Please add images before extracting text.", [
                { text: "Understood", style: "cancel" }
            ])
        } else {
            router.push("/ExtractedText")
        }
    }

    const ClearAllImage = () => {
        if (ImageListURI.length <= 0) {
            Alert.alert("Nothing to clear", "Your image queue is already empty.")
            return
        }

        Alert.alert("Clear Queue", "Are you sure you want to remove all images?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Clear All", 
                style: "destructive",
                onPress: () => {
                    setText("")
                    setImageListURI([])
                }
            }
        ])
    }

    return (
        <View className="w-full flex-row items-center justify-between px-2 py-4 gap-x-3">
            <Pressable 
                onPress={ClearAllImage}
                className="flex-1 h-14 border border-neutral-200 bg-white rounded-2xl flex-row items-center justify-center active:bg-neutral-50"
            >
                <Feather name="refresh-cw" size={16} color="black" />
                <Text className="text-neutral-900 font-bold ml-2 text-xs uppercase tracking-widest">
                    Clear
                </Text>
            </Pressable>
            <Pressable
                onPress={handleExtracttext}
                className="flex-[2] h-14 bg-neutral-900 rounded-2xl flex-row items-center justify-center active:opacity-90 shadow-sm"
            >
                <Feather name="cpu" size={18} color="white" />
                <Text className="text-white font-bold ml-3 text-sm">
                    Process {ImageListURI.length > 0 ? `(${ImageListURI.length})` : ''}
                </Text>
            </Pressable>
        </View>
    )
}