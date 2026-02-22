import { View, TextInput, Pressable, Text, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import Logo from "@/components/Logo";
import { User, Lock, Truck } from "lucide-react-native"; // icons
import { useState } from "react";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login pressed", username, password);
    // Example dispatch (uncomment when backend ready)
    // dispatch(
    //   loginSuccess({
    //     id: "1",
    //     username,
    //     role: "driver",
    //     token: "fake-jwt-token",
    //   })
    // );
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
          <Logo  />
          <Text className="text-2xl font-black text-slate-800 mt-4">
            DHAMAN <Text className="text-blue-600">PRO</Text>
          </Text>
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            DRIVER OPERATIONS PORTAL
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-5">
          {/* Username */}
          <View>
            <Text className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-wider">
              USERNAME
            </Text>
            <View className="relative mt-1">
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="USERNAME"
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm"
                style={{ textAlign: "right" }}
              />
              <User
                size={16}
                color="#94a3b8"
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-wider">
              PASSWORD
            </Text>
            <View className="relative mt-1">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="PASSWORD"
                secureTextEntry
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm"
                style={{ textAlign: "right" }}
              />
              <Lock
                size={16}
                color="#94a3b8"
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            className="w-full bg-[#1e293b] py-4 rounded-xl flex flex-row items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Text className="text-white font-black text-xs">SIGN IN TO FIELD</Text>
            <Truck size={16} color="white" />
          </Pressable>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text className="text-[9px] text-rose-500 font-bold mb-6">
            نرجو التأكد من الشروط و الضوابط لدى المجمع
          </Text>
          <Text className="text-[8px] text-slate-300 font-bold">
            © 2026 DHAMAN PRO LOGISTICS. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}