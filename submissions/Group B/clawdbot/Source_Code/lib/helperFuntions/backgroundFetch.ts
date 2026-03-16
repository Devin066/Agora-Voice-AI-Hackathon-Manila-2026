import * as taskManager from "expo-task-manager";
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { storage } from "@/lib/MMKVConfig";
import { fetchGeminiQuizData } from "@/lib/helperFuntions/backgroundQuizFetch";

export const CREATING_QUIZ_TASK = "Creating_Quiz";

taskManager.defineTask(CREATING_QUIZ_TASK, async () => {
  try {
    const allPendingRaw = storage.getString("pendingQuizId");
    const pendingIds: string[] = allPendingRaw ? JSON.parse(allPendingRaw) : [];

    if (pendingIds.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

    for (const id of pendingIds) {
      const pendingDataRaw = storage.getString(id);
      if (!pendingDataRaw) continue;

      const params = JSON.parse(pendingDataRaw);

      await fetchGeminiQuizData(params.text, params.count, params.difficulty);

      const updatedPending = pendingIds.filter(pId => pId !== id);
      storage.set("pendingQuizId", JSON.stringify(updatedPending));
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Quiz Ready! ✨",
        body: "Your AI background generator has finished.",
      },
      trigger: null,
    });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error("Task Error:", err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});