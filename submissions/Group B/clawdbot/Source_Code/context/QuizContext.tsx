import React, {createContext, useState} from "react"

interface QuizContextType {
   Quiz : string | undefined
   setQuiz : React.Dispatch<React.SetStateAction<string | undefined>> 
}

export const QuizContext = createContext<QuizContextType | undefined>(undefined)


export default function QuizContextProvider({children} : {children : React.ReactNode}) {
    const [Quiz, setQuiz] = useState<string | undefined>()
    return <QuizContext.Provider value={{Quiz, setQuiz}}>
            {children}
    </QuizContext.Provider>
}