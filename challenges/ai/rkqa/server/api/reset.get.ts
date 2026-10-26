import stores from "../utils/stores"

export default defineEventHandler((_) => {
  stores.clearHistory();
  return { success: true };
})
