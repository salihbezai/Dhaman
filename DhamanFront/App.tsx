import { Provider } from "react-redux";
import { store } from "./src/app/store";
import "expo-router/entry"; // required for Expo Router
import "./global.css";

export default function App() {
  return (
    <Provider store={store}>
  
    </Provider>
  );
}