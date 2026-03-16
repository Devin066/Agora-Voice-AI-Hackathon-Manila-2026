import * as documentPicker from "expo-document-picker"
import {useState} from "react"




export default function useDocumentPicker() {

    const [errMessage, setErrMessage] = useState<string>("")
    const [document, setDocument] = useState<documentPicker.DocumentPickerAsset | null> (null)
    const PickDocument = async () => {
        try {
        const documentResult = await documentPicker.getDocumentAsync({
            type : "application/pdf",
            copyToCacheDirectory : true,
            multiple : false,
        })        
        if(!documentResult.canceled) {
        setDocument(documentResult.assets[0])
        return documentResult.assets[0]
        }
 
        } catch(err) {
            setErrMessage(err as string)
        }
   }
    return {errMessage, PickDocument, document, setDocument } 
} 