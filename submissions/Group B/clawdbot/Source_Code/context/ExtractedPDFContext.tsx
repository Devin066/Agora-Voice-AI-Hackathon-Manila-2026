import React, {createContext, useState} from "react"


interface ExtractedPDFContextType {
    text : string | null
    setText : React.Dispatch<React.SetStateAction<string | null>>
}


export const ExtractedPDFContext = createContext<ExtractedPDFContextType | undefined>(undefined)


export default function ExtractedPDFContextProvider({children} : {children : React.ReactNode}) {
    const [text, setText] = useState<string | null>("")
    return <ExtractedPDFContext.Provider value={{text, setText}}>
        {children}
    </ExtractedPDFContext.Provider>
}