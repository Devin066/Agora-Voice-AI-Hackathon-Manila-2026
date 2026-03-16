import { useState, useCallback } from "react"
import TextRecognition from "@react-native-ml-kit/text-recognition"

export default function useImageRecognition() {
  const [text, setText] = useState<string>("")
  const [isReady, setIsReady] = useState<boolean>(false)

  const Recognize = useCallback(async (imageURI: string) => {
    const RecognizeText = await TextRecognition.recognize(imageURI)

    // Append text instead of overwriting
    setText(prev => prev + "\n" + RecognizeText.text)

    // Set isReady after recognition completes
    setIsReady(true)
  }, [])

  return { text, Recognize, isReady, setText }
}
