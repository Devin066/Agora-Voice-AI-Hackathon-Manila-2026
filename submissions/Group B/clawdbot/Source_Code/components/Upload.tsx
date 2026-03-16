import { View, Text, Pressable, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useContext, useState } from "react"
import useImagePicker from "@/hooks/useImagePicker"
import { ImageContext } from "@/context/ImageContext"
import CameraModal from "./Camera" 
export default function Upload() {
  const context = useContext(ImageContext)
  const [isCameraVisible, setIsCameraVisible] = useState(false)
  
  if (!context) return null

  const { ImageListURI, setImageListURI } = context
  const { pickImage } = useImagePicker()

  const handleGalleryUpload = async () => {
    const uris = await pickImage() 
    if (!uris || uris.length === 0) return 
    setImageListURI((prev) => [...prev, ...uris])
  }

  const handleCameraCapture = (uri: string) => {
    setImageListURI((prev) => [...prev, uri])
  }

  return (
    <View className="w-full border-2 border-dashed border-neutral-200 bg-neutral-50 rounded-[32px] p-8 my-4">
      <View className="items-center justify-center">
        <View className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-sm mb-4">
          <Feather name="layers" size={24} color="black" />
        </View>

        <Text className="text-xl font-bold text-neutral-900">
          Source Material
        </Text>
        <Text className="text-neutral-400 text-sm text-center mt-1 mb-6">
          Upload or capture images for study
        </Text>

        <View className="flex-row gap-x-3 w-full">
          <Pressable
            onPress={() => setIsCameraVisible(true)}
            className="flex-1 h-14 bg-neutral-900 rounded-2xl flex-row items-center justify-center active:opacity-80"
          >
            <Feather name="camera" size={18} color="white" />
            <Text className="text-white font-bold ml-2">Camera</Text>
          </Pressable>

          <Pressable
            onPress={handleGalleryUpload}
            className="flex-1 h-14 bg-white border border-neutral-200 rounded-2xl flex-row items-center justify-center active:bg-neutral-100"
          >
            <Feather name="image" size={18} color="black" />
            <Text className="text-neutral-900 font-bold ml-2">Gallery</Text>
          </Pressable>
        </View>

        {ImageListURI.length > 0 && (
          <View className="mt-4 flex-row items-center bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <Feather name="check-circle" size={14} color="#22c55e" />
            <Text className="text-green-700 text-xs font-bold ml-2">
              {ImageListURI.length} {ImageListURI.length === 1 ? 'Image' : 'Images'} Ready
            </Text>
          </View>
        )}
      </View>

      <CameraModal 
        visible={isCameraVisible} 
        onClose={() => setIsCameraVisible(false)} 
        onCapture={handleCameraCapture} 
      />
    </View>
  )
}