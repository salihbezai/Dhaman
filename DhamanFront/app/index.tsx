import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { setCredentials } from "../src/features/auth/authSlice";
import api from "@/src/api/axios";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");

        if (token) {
          const { data } = await api.get("/auth/me");
          
          dispatch(
            setCredentials({
              user: data.user, // This includes data.user.role
              token: token,
            }),
          );

          setUserRole(data.user.role);
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await SecureStore.deleteItemAsync("accessToken");
          setUserRole(null);
        } else {
          // If network error, you might want to try reading from a local 
          // 'user' object if you saved one in SecureStore previously
          setUserRole(null); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }


  if (!userRole) {
    return <Redirect href="/(auth)/login" />;
  }



  return <Redirect href="/(tabs)" />;
}