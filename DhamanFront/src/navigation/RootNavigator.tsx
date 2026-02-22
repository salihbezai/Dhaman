import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

import LoginScreen from "../screens/auth/LoginScreen";
import ConfirmerHomeScreen from "../screens/confirmer/ConfirmerHomeScreen";
import DriverHomeScreen from "../screens/driver/DriverHomeScreen";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === "confirmer" ? (
          <Stack.Screen name="ConfirmerHome" component={ConfirmerHomeScreen} />
        ) : user.role === "driver" ? (
          <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
        ) : (
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}