import React, { createContext, useState } from "react"

interface ImageContextType {
  ImageListURI: string[]
  setImageListURI: React.Dispatch<React.SetStateAction<string[]>>
}

export const ImageContext = createContext<ImageContextType | undefined>(undefined)

export default function ImageContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [ImageListURI, setImageListURI] = useState<string[]>([])

  return (
    <ImageContext.Provider
      value={{ ImageListURI, setImageListURI }}
    >
      {children}
    </ImageContext.Provider>
  )
}
