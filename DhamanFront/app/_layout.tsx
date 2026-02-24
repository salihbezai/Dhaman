import { Provider } from "react-redux";
import { Stack } from "expo-router";
import "../global.css";
import { store } from "@/src/store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}