import {View, ScrollView} from "react-native"
import {useSafeAreaInsets} from "react-native-safe-area-context"
import ImageFlatList from "@/components/ImageFlatList"
import Upload from "@/components/Upload"
import ButtonSelection from "@/components/ButtonsSelection"


export default function ImageToText() {
    const inset = useSafeAreaInsets()
    return <View style={{
        paddingBottom : inset.bottom
    }} className="flex-1 px-5 ">
            <Upload />
            <ButtonSelection />
            <ImageFlatList />
    </View>
}