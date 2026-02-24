import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    return error.message || "Unexpected server error";
  },
});
