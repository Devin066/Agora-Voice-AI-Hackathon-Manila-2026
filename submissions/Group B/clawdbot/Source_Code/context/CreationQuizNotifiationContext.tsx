

import React, {createContext, useContext, useState, useEffect} from "react"
import notifee, {EventType} from "@notifee/react-native" 
import {startForegroundService, stopForegroundService} from "@/lib/helperFuntions/foregroundUtils"

interface NotifecationContextType  {
    isServiceRunning : boolean,
    startForegroundService : (title : string, body: string, screen? : any, data? : any) => void,
    stopForegroundService : () => void
}


export const NotificationContext = createContext<NotifecationContextType | undefined>(undefined)

export default function useNotificationContext() {
    const context = useContext(NotificationContext)
    return context
}

export const  NotificationContextProvider =  ({children} : {children: React.ReactNode})  =>  {

    const [isServiceRunning, setIsServiceRunning] = useState<boolean>(false)

    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(type, detail) => {
            if (type === EventType.ACTION_PRESS) {
                
            }
        }
    }, [])


    return <NotificationContext.Provider value={{}}>
        {children}
    </NotificationContext.Provider>
}