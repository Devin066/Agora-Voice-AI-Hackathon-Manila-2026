import { FlashList } from "@shopify/flash-list"
import { Feather } from "@expo/vector-icons"
import { useContext } from "react"
import { Image, View, Text, Pressable } from "react-native"
import { ImageContext } from "@/context/ImageContext"

export default function ImageFlatList() {
  const context = useContext(ImageContext)
  if (!context) return null;

  const { ImageListURI, setImageListURI } = context

  const handleDeleteImage = (indexId: number) => {
    setImageListURI(prev => prev.filter((_, index) => index !== indexId))
  }

  return (
    <FlashList
      data={ImageListURI}
      keyExtractor={(uri, index) => `${uri}-${index}`}
      estimatedItemSize={250}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      renderItem={({ item, index }) => (
        <View className="mb-6 bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
          {/* Header Overlay */}
          <View className="absolute top-4 left-4 right-4 z-10 flex-row justify-between items-center">
            <View className="bg-neutral-900 px-3 py-1.5 rounded-full shadow-sm">
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                Page {index + 1}
              </Text>
            </View>

            <Pressable 
              onPress={() => handleDeleteImage(index)} 
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm active:bg-red-50"
            >
              <Feather name="trash-2" size={16} color="black" />
            </Pressable>
          </View>

          {/* Image */}
          <Image
            source={{ uri: item }}
            className="w-full h-64 bg-neutral-50"
            resizeMode="cover"
          />

          {/* Subtle footer label */}
          <View className="px-5 py-3 bg-white border-t border-neutral-50">
            <Text className="text-neutral-400 text-[10px] font-medium italic">
              Ready for extraction
            </Text>
          </View>
        </View>
      )}
    />
  )
}