import stores from "../utils/stores"

export default defineEventHandler((_) => {
  return {
    history: stores.chatHistory.slice(1),
  };
})
