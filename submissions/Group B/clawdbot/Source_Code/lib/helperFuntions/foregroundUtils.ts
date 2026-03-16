import notifee, {AndroidImportance, AndroidColor} from "@notifee/react-native"

export const createChannel = async () => {
    return await notifee.createChannel({
        id : "CreatingQuiz",
        name : "Creating QUiz",
        importance : AndroidImportance.HIGH
    })
}

export const startForegroundService = async (title :  string, body: string, screen? : any , data? : any) => {
    const channelID = await createChannel()
    await notifee.displayNotification({
        title,
        body,
        android : {
            channelId : channelID,
            asForegroundService : true,
            color : AndroidColor.BLACK,
            pressAction :{
                id : "default"
            }

        }
    })

}


export const ShowNotification = async () => {
     const channelId = await notifee.createChannel({
        id : "CreatingQuiz",
        name : "Creating Quiz",
        importance : AndroidImportance.HIGH
    })

    await notifee.displayNotification({
        title: 'Quiz Created ',
        body: 'Your AI quiz has been successfully generated.',
        android: {
      channelId,
      color: AndroidColor.GREEN,
      pressAction: { id: 'default' },
    },
    })
}


export const stopForegroundService = async () => {
    await notifee.stopForegroundService()
}