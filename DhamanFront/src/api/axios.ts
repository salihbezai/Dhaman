import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 5000, // Optional: Set a timeout for requests

});

// REQUEST INTERCEPTOR: Attach Access Token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// RESPONSE INTERCEPTOR: Handle 401 (Expired Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const storedRefresh = await SecureStore.getItemAsync("refreshToken");

      if (!storedRefresh) return Promise.reject(error);

      try {
        // IMPORTANT: Use EXPO_PUBLIC_API_URL here too
        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { token: storedRefresh }
        );

        // Save new tokens
        await SecureStore.setItemAsync("accessToken", data.token);
        if (data.refreshToken) {
           await SecureStore.setItemAsync("refreshToken", data.refreshToken);
        }

        // Update the header for the original request and retry
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axios(originalRequest); 
      } catch (refreshError) {
        // If refresh fails, session is dead
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;