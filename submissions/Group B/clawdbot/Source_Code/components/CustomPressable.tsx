import React from "react"
import {Text, View, StyleSheet, Platform} from "react-native"
import {Pressable} from "react-native-gesture-handler"

interface CustomPressableType {
    localDifficulty : string
    setLocalDifficulty : React.Dispatch<React.SetStateAction<string>>  
    levels :  string[]
}

export default function CustomPressable ({localDifficulty, levels, setLocalDifficulty} : CustomPressableType) {

    return (
        <View className="flex-row bg-neutral-100 p-1 rounded-2xl">
            {
                levels.map((level) => {
    const isSelected = localDifficulty === level;
    return  (<Pressable
      key={level}
      onPress={() => setLocalDifficulty(level)}
      style={styles.pressableWrapper}
    >
      <View style={[
        styles.segmentBase, 
        isSelected ? styles.segmentSelected : styles.segmentUnselected
      ]}>
        <Text style={[
          styles.labelText, 
          isSelected ? styles.textActive : styles.textInactive
        ]}>
          {level}
        </Text>
      </View>
    </Pressable>)
        })
            }
        </View>
    
    )
}

const styles = StyleSheet.create({
  pressableWrapper: {
    flex: 1,
  },
  segmentBase: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: "#FFFFFF",
    borderRadius : 25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentUnselected: {
    backgroundColor: "transparent",
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  textActive: {
    color: "#171717", 
  },
  textInactive: {
    color: "#A3A3A3", 
  },
})