import { storage } from "@/lib/MMKVConfig"

export const useMMKV = () => {
  const getIsFirstOpen = () => {
    const hasOpened = storage.getBoolean("hasOpened")
    return hasOpened === undefined ? true : !hasOpened
  }

  const setOpenedInStorage = () => {
    storage.set("hasOpened", true)
  }

  return { getIsFirstOpen, setOpenedInStorage }
}
