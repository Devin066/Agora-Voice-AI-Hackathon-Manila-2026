import * as ImagePicker from "expo-image-picker"
import { Alert } from "react-native"

export default function useImagePicker() {
  const pickImage = async (): Promise<string[]> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Permission access to the storage is required"
      )
      return []
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (result.canceled) {
      return []
    }

    return result.assets.map(asset => asset.uri)
  }

  return { pickImage }
}
