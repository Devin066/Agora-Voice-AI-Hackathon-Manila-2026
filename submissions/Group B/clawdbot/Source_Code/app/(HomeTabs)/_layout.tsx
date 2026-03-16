import {Pressable, Text} from "react-native"
import {Feather, AntDesign, MaterialIcons } from "@expo/vector-icons"
import {StatusBar} from "react-native"
import {Tabs} from "expo-router/tabs"
import {useNavigation} from "expo-router"
import {DrawerActions} from "@react-navigation/native"


export default function HomeTabLayout() {
  const activeColor ="#BC13FE" 
  const navigator = useNavigation()
    return<>
    <StatusBar barStyle={"light-content"} /> 
     <Tabs screenOptions={{
      headerStyle :{
        backgroundColor : "#000"
      },
      headerTitle : () => (
        <Pressable className="text-white">
        </Pressable>
      ),
      headerLeft : () => (
        <Pressable onPress={() => navigator.dispatch(DrawerActions.openDrawer)} className="mx-5">
          <Feather name="menu" color="#fff" size={24}/>
        </Pressable>
      ),
      headerRight : () => (
        <Pressable className="">
          <Feather className="mx-5" name="more-horizontal" color="#fff" size={24} />
        </Pressable>
      ),
      headerTitleAlign : "center",
      tabBarStyle : {
        backgroundColor : "#000"

      }, tabBarActiveTintColor : activeColor,
      tabBarInactiveTintColor : "#fff"
    }} >
      <Tabs.Screen
      name="Home" 
      options={{
        title : "Home",
        tabBarIcon : ({focused}) => (

          <Feather name="home" size={18} color={focused ? activeColor : "#fff"  } />
        )
      }}
      >

      </Tabs.Screen>
   <Tabs.Screen
      name="Quiz" 
      options={{
        title : "Quiz",
        tabBarIcon : ({focused}) => (

          <MaterialIcons name="quiz" size={18} color={focused ? activeColor : "#fff"  } />
        )
      }}
      >
      </Tabs.Screen>
 
  <Tabs.Screen
      name="History" 
      options={{
        title : "History",
        tabBarIcon : ({focused}) => (

          <AntDesign name="history" size={18} color={focused ? activeColor : "#fff"  } />
        )
      }}
      >

      </Tabs.Screen>
   <Tabs.Screen
      name="Settings" 
      options={{
        title : "Setting",
        tabBarIcon : ({focused}) => (

          <Feather name="settings" size={18} color={focused ? activeColor : "#fff"  } />
        )
      }}
      >

      </Tabs.Screen>
   
    </Tabs>
</>
}