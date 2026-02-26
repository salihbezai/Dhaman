import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { View, ActivityIndicator, Text } from "react-native";

// Import your dashboard components
import SupervisorDashboard from "../../components/dashboards/SupervisorDashboard";
import DriverDashboard from "../../components/dashboards/DriverDashboard";
import ConfirmerDashboard from "@/components/dashboards/ConfirmerDashboard";

export default function TabIndex() {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  // Role-based logic
  switch (user?.role) {
    case "SUPERVISOR":
      return <SupervisorDashboard />;
    case "DRIVER":
      return <DriverDashboard />;
    case "CONFIRMER":
      return <ConfirmerDashboard />;
    default:
      return (
        <View className="flex-1 justify-center items-center">
          <Text>خطأ: لم يتم التعرف على الرتبة</Text>
        </View>
      );
  }
}