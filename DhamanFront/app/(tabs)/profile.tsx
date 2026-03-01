import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/src/store/store";
import { logoutUser } from "../../src/features/auth/authActions";
import { useRouter } from "expo-router";
import {
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react-native";
import { ROLE_LABELS_AR } from "@/src/utils/utility";
import { logout } from "../../src/features/auth/authSlice";
import packageJson from "../../package.json";
export default function ProfileScreen() {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    // clear tokens and state
    dispatch(logout());
    router.replace("/(auth)/login");
  };


  if (!user) return <ActivityIndicator size="large" className="flex-1" />;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header / Cover Area */}
      <View className="bg-[#1e293b] pt-16 pb-24 px-6 items-center rounded-b-[40px]">
        <View className="relative">
          <Image
            source={{
              uri: user.profileImageUrl || "https://via.placeholder.com/150",
            }}
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl"
          />
          <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white" />
        </View>
        <Text className="text-white text-xl font-black mt-4 uppercase tracking-tight">
          {user?.username}
        </Text>
        <View className="bg-blue-600/20 px-4 py-1 rounded-full mt-2 border border-blue-400/30">
          <Text className="text-blue-300 font-bold text-[10px] uppercase tracking-widest">
            {ROLE_LABELS_AR[user?.role as keyof typeof ROLE_LABELS_AR] ||
              "غير معروف"}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View className="px-6 -mt-12">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <InfoRow
            icon={<Mail size={18} color="#94a3b8" />}
            label="البريد الإلكتروني"
            value={user?.email}
          />
          <Divider />
          <InfoRow
            icon={<Phone size={18} color="#94a3b8" />}
            label="رقم الهاتف"
            value={user?.phone}
          />
          <Divider />
          <InfoRow
            icon={<ShieldCheck size={18} color="#94a3b8" />}
            label="الصلاحية"
            value={
              ROLE_LABELS_AR[user?.role as keyof typeof ROLE_LABELS_AR] ||
              "غير معروف"
            }
          />
        </View>

        {/* Actions */}
        <Pressable
          onPress={handleLogout}
          className="mt-8 flex-row items-center justify-center bg-red-50 py-4 rounded-2xl border border-red-100 active:bg-red-100"
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-red-500 font-black mr-2">تسجيل الخروج</Text>
        </Pressable>
      </View>

      <Text
        className="text-center text-slate-300 font-bold text-[10px] mt-10 
      uppercase tracking-widest pb-10"
      >
         © 2026 Dhaman Logistics Solutions V{packageJson.version}
      </Text>
    </ScrollView>
  );
}

// Small helper components for cleaner code
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View className="flex-row-reverse items-center justify-between py-2">
    <View className="flex-row-reverse items-center gap-3">
      <View className="bg-slate-50 p-2 rounded-xl">{icon}</View>
      <View>
        <Text className="text-slate-400 text-[10px] font-bold text-right uppercase">
          {label}
        </Text>
        <Text className="text-slate-700 font-bold text-sm text-right">
          {value}
        </Text>
      </View>
    </View>
  </View>
);

const Divider = () => <View className="h-[1px] bg-slate-50 my-2" />;
