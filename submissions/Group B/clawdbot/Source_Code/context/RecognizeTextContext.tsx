import React, {createContext, useState} from "react"


export interface RecognizeTextType {
    Text : string | undefined,
    SetText : React.Dispatch<React.SetStateAction<string | undefined>>
}


export const RecognizeTextContext = createContext<RecognizeTextType | undefined>(undefined)


export  function RecognizeTextProvider({children} : {children : React.ReactNode}) {
    const [Text, SetText] = useState<string>()
    
    return <RecognizeTextContext.Provider value={{Text, SetText}} >
        {children}
    </RecognizeTextContext.Provider>
} 

