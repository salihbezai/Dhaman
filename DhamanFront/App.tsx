import { Provider } from "react-redux";
import { store } from "./src/app/store";
import RootNavigator from "./src/navigation/RootNavigator";
import "./global.css";
export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}