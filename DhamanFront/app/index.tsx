import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { setCredentials } from "../src/features/auth/authSlice";
import api from "@/src/api/axios";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");

        if (token) {
          // 1. If we have a token, try to fetch the latest profile to re-hydrate Redux
          // This ensures state.auth.user is populated throughout the app
          const { data } = await api.get("/auth/me");
          dispatch(
            setCredentials({
              user: data.user,
              token: token,
            }),
          );

          setHasToken(true);
        }
      } catch (error: any) {
        // ONLY clear tokens if the error is specifically "Unauthorized" (401/403)
        // If it's a 500 or a Network Error, don't kick the user out!
        if (error.response?.status === 401 || error.response?.status === 403) {
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          setHasToken(false);
        } else {
          // If it's a network error, we can't verify, but we can
          // either trust the local token or show an error screen.
          // For now, let's let them through if the token exists locally:
          setHasToken(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1e293b" />
      </View>
    );
  }
  // If we have a token and user data, go to Tabs. Otherwise, go to Login.
  return hasToken ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
