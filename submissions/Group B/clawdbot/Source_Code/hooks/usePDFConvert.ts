import {extractText} from "expo-pdf-text-extract"
import {useState} from "react"


export default function usePDFConvert () {
    const [pdfText, setText] = useState<string>()
    async function getPDFText (uri : string | null) {
        if (!uri) return null // change this to return a error message instead
        const text  = await extractText(uri)
        setText(text)
        return text
    }
    return {pdfText, getPDFText}
}