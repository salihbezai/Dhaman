import {
  View,
  TextInput,
  Pressable,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from "react-redux";
import Logo from "@/components/Logo";
import { User, Lock, LogIn } from "lucide-react-native";
import { useState, useEffect } from "react";
import { loginUser } from "@/src/features/auth/authActions";
import { RootState, AppDispatch } from "@/src/store/store"; // Ensure AppDispatch is exported from store
import { useRouter } from "expo-router";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Get loading and error state from Redux
  const { error, loading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  // if the user is already logged in, redirect to tabs
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        "خطأ في الإدخال",
        "يرجى التأكد من إدخال إسم المستخدم وكلمة السر",
        [
          {
            text: "حسناً",
            style: "default",
          },
        ],
      );
      return;
    }

    // Dispatch the action. We use .unwrap() to handle the promise result directly
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      // If successful, the index.tsx or this component can redirect
      router.replace("/(tabs)");
    } catch (err: any) {
      // Error is already handled in the slice/action
      
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F3F4F6]"
      contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      style={{ direction: "rtl" }}
    >
      <View className="bg-white h-full w-full max-w-md mx-auto p-8 rounded-[40px] shadow-lg border border-slate-100">
      <StatusBar style="dark" />
        {/* Logo & Header */}
        <View className="items-center mb-10">
          <Logo />
          <Text className="text-2xl font-black text-slate-800">
            DHAMAN <Text className="text-blue-600">PRO</Text>
          </Text>
          <Text className="text-slate-400 text-[15px] font-bold uppercase tracking-widest mt-1">
            تسجيل الدخول
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-5">
          {/* Error Message Display */}
          {error && (
            <View className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
              <Text className="text-red-600 text-center font-bold text-xs">
                {error}
              </Text>
            </View>
          )}

          {/* Username Input */}
          <View className="mt-4">
            <Text className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-wider">
              إسم المستخدم
            </Text>
            <View className="relative mt-1 justify-center">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="أدخل إسم المستخدم"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
                className="w-full px-5 pr-12 py-3.5 rounded-xl border border-slate-200 font-bold text-sm text-right"
              />
              <User
                size={18}
                color="#94a3b8"
                style={{ position: "absolute", right: 15 }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mt-4">
            <Text className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-wider">
              كلمة السر
            </Text>
            <View className="relative mt-1 justify-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="أدخل كلمة السر"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="w-full px-5 pr-12 py-3.5 rounded-xl border border-slate-200 font-bold text-sm text-right"
              />
              <Lock
                size={18}
                color="#94a3b8"
                style={{ position: "absolute", right: 15 }}
              />
            </View>
          </View>

          {/* Login Button */}
          <View className="mt-6">
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`w-full py-4 rounded-xl flex flex-row items-center justify-center gap-2 shadow-lg ${
                loading ? "bg-slate-400" : "bg-[#1e293b]"
              } active:scale-95`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <LogIn size={16} color="white" />
                  <Text className="text-white font-black text-xs">
                    تسجيل الدخول
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text className="text-[10px] text-slate-400 uppercase tracking-widest text-center">
            © 2026 DHAMAN PRO LOGISTICS{"\n"}جميع الحقوق محفوظة
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
