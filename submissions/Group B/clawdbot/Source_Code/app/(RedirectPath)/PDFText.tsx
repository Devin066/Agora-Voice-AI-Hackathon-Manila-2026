import React, { useState, useContext } from "react";
import { View, Pressable, Text, ActivityIndicator, Alert } from "react-native";
import useDocumentPicker from "@/hooks/useDocumentPicker";
import { Feather } from "@expo/vector-icons";
import usePDFConvert from "@/hooks/usePDFConvert"
import {useRouter}from "expo-router"
import CustomLoader from "@/components/CustomLoader"
import {ExtractedPDFContext}from "@/context/ExtractedPDFContext" 

export default function PDFText() {
  const { PickDocument, document, setDocument } = useDocumentPicker();
  const [isLoading, setIsLoading] = useState(false);
  const {getPDFText, pdfText} = usePDFConvert()
  const PDFTextContext = useContext(ExtractedPDFContext)


  if (!PDFTextContext) return  

  const {setText, text} = PDFTextContext
  const router = useRouter()
  

  const handleExtract = async () => {
    if (!document) return
    const ExtractedText= await getPDFText(document.uri) 
    setText(ExtractedText)
    router.push("/(RedirectPath)/ExtractedText")
  }
  //add loading statte from pdfExtractio


  return (
    <View className="flex-1 flex-col gap-y-5 bg-white p-5">
      <View className="w-full relative px-5">
        <Pressable 
          onPress={PickDocument}
          className={`w-full h-40 border-2 border-dashed rounded-xl items-center justify-center ${
            document ? "border-green-500 bg-green-50" : "border-neutral-300 bg-neutral-50"
          }`}
        >
              <Feather 
                name={document ? "file-text" : "upload-cloud"} 
                size={32} 
                color={document ? "#10b981" : "#737373"} 
              />
              <Text className="mt-2 px-4 text-neutral-600 font-medium">
                {document ? document.name : "Tap to Upload PDF"}
              </Text>
        </Pressable>
      </View>
      {document && <Pressable onPress={() => setDocument(null)} className="absolute top-3 right-7">
         <Feather name="x-circle" size={24} color="black" /> 
      </Pressable>}
      <View className="flex flex-row gap-x-5">
          <Pressable>

          </Pressable>
          <Pressable  className="border px-5 py-2 rounded-md bg-black text-white" onPress={handleExtract}>
          <Text className="text-white font-extrabold">Extract Text</Text>
          </Pressable>
      </View>
    </View>
  );
}