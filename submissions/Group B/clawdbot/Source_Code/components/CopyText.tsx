import { Pressable, View, Text } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import { useState } from "react"

interface CopyTextProp {
    textToCopy: string
}

export default function CopyText({ textToCopy }: CopyTextProp) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    if (!textToCopy || textToCopy.trim() === "") return;
    
    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Pressable 
      onPress={handleCopyText}
      className={`h-10 px-4 rounded-xl flex-row items-center justify-center border ${
        copied ? 'border-green-100 bg-green-50' : 'border-neutral-200 bg-white'
      } active:bg-neutral-50`}
    >
      <Feather 
        name={copied ? "check" : "copy"} 
        size={14} 
        color={copied ? "#16a34a" : "#737373"} 
      />
      <Text 
        className={`ml-2 text-xs font-bold uppercase tracking-widest ${
          copied ? 'text-green-600' : 'text-neutral-500'
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </Text>
    </Pressable>
  );
}