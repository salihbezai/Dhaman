import { View, TextInput, Pressable, Text, ScrollView } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
import Logo from "@/components/Logo";
import { User, Lock, LogIn } from "lucide-react-native"; // icons
import { useState } from "react";
// import { LoginPayload, loginUser } from "@/src/features/auth/authActions";
// import { RootState } from "@/src/app/store";
import { useRouter } from "expo-router/build/exports";

export default function Login() {
//   const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

//   const { error, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const handleLogin = () => {
    console.log("Login pressed", username, password);
    // Example dispatch (uncomment when backend ready)
    // dispatch(loginUser({ username, password }) as LoginPayload);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F3F4F6]"
      contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      style={{ direction: "rtl" }}
    >
      <View className="bg-white h-full w-full max-w-md mx-auto p-8 rounded-[40px] shadow-lg border border-slate-100">
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
          {/* show popup if error  */}
          {/* {error && (
            <View className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <Text className="text-sm">{error}</Text>
            </View>
          )} */}
          {/* Username */}
          <View className="mt-4">
            <Text className="text-[10px] font-black text-black-400 mr-2 uppercase tracking-wider">
              إسم المستخدم
            </Text>
            <View className="relative mt-1 justify-center">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="أدخل إسم المستخدم"
                placeholderTextColor="#94a3b8"
                className="w-full px-5 pr-12 py-3.5 rounded-xl border border-slate-200 font-bold text-sm"
                style={{ textAlign: "right" }}
              />

              <User
                size={18}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10, // manual vertical centering
                }}
              />
            </View>
          </View>

          {/* Password */}
          <View className="mt-4">
            <Text className="text-[10px] font-black text-black-400 mr-2 uppercase tracking-wider">
              كلمة السر
            </Text>

            <View className="relative mt-1">
              {/* Icon wrapper for perfect vertical centering */}
              <View className="absolute right-3 inset-y-0 justify-center">
                <Lock size={18} color="#94a3b8" />
              </View>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="أدخل كلمة السر"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="w-full px-5 pr-12 py-3.5 rounded-xl border border-slate-200 font-bold text-sm"
                style={{ textAlign: "right" }}
              />
            </View>
          </View>

          {/* Login Button */}
          <View className="mt-6">
            <Pressable
              className="w-full bg-[#1e293b] py-4 rounded-xl flex flex-row items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <LogIn size={16} color="white" />
              <Text className="text-white font-black text-xs">
                {"تسجيل الدخول"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text className="text-[10px] text-black-300  uppercase tracking-widest">
            © 2026 DHAMAN PRO LOGISTICS جميع الحقوق محفوظة
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
