import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // Check if message is the multi-lang object we created
    if (data?.message && typeof data.message === "object") {
      return data.message.ar; // Return the Arabic version by default
    }

    return data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "حدث خطأ غير متوقع"; 
};
