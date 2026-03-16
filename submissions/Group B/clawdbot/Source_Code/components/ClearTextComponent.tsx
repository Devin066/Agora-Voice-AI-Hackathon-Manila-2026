import { Pressable, Text, Alert } from "react-native"
import React from "react"
import { Feather } from "@expo/vector-icons"

interface ClearTextComponentProp {
    text: string
    setText: React.Dispatch<React.SetStateAction<string>> 
}

export default function ClearTextComponent({ text, setText }: ClearTextComponentProp) {
    const handleClearTextComponent = () => {
        if (text.trim() !== "") {
            Alert.alert(
                "Clear Content", 
                "Are you sure you want to delete all extracted text?", 
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Clear", 
                        style: "destructive", 
                        onPress: () => setText("") 
                    }
                ]
            )
        } else {
            Alert.alert("Empty", "There is no text to clear.")
        }
    }

    return (
        <Pressable 
            onPress={handleClearTextComponent}
            className="flex-row items-center justify-center px-4 h-10 border border-neutral-200 bg-white rounded-xl active:bg-neutral-50"
        >
            <Feather name="trash-2" size={14} color="#737373" />
            <Text className="text-neutral-500 font-bold ml-2 text-xs uppercase tracking-widest">
                Clear
            </Text>
        </Pressable>
    )
}