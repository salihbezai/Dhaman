import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  TouchableOpacity,
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
  User,
  Lock,
  Edit3,
  X,
} from "lucide-react-native";
import { ROLE_LABELS_AR } from "@/src/utils/utility";
import { logout } from "../../src/features/auth/authSlice";
import packageJson from "../../package.json";
import { updateUserProfileInfo } from "@/src/features/user/userActions";

export default function ProfileScreen() {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Updated form to include Email and Phone
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout());
    router.replace("/(auth)/login");
  };

  const handleUpdate = async () => {
    if(!form.username || !form.email || !form.phone) {
      Alert.alert("تنبيه", "يرجى ملء جميع الحقول الأساسية");
      return;
    }
    if (!form.currentPassword) {
      Alert.alert("تنبيه", "يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات");
      return;
    }

    try {
      setUpdating(true);
      await dispatch(updateUserProfileInfo({id: user!.id, userInfo: form})).unwrap();
      Alert.alert("نجاح", "تم تحديث البيانات بنجاح");
      setModalVisible(false);
      setForm({ ...form, currentPassword: "", newPassword: "" });
    } catch (err: any) {
      Alert.alert("خطأ", err || "فشل تحديث البيانات");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return <ActivityIndicator size="large" className="flex-1" />;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header / Cover Area */}
      <View className="bg-[#1e293b] pt-16 pb-24 px-6 items-center rounded-b-[40px]">
        <View className="relative">
          <Image
            source={{ uri: user.profileImageUrl || "https://via.placeholder.com/150" }}
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl"
          />
          <Pressable 
            onPress={() => setModalVisible(true)}
            className="absolute bottom-1 right-1 bg-blue-600 w-8 h-8 rounded-full border-2 border-white items-center justify-center"
          >
            <Edit3 size={14} color="white" />
          </Pressable>
        </View>
        <Text className="text-white text-xl font-black mt-4 uppercase tracking-tight">
          {user?.username}
        </Text>
        <View className="bg-blue-600/20 px-4 py-1 rounded-full mt-2 border border-blue-400/30">
          <Text className="text-blue-300 font-bold text-[10px] uppercase tracking-widest">
            {ROLE_LABELS_AR[user?.role as keyof typeof ROLE_LABELS_AR] || "غير معروف"}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View className="px-6 -mt-12">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <InfoRow icon={<Mail size={18} color="#94a3b8" />} label="البريد الإلكتروني" value={user?.email} />
          <Divider />
          <InfoRow icon={<Phone size={18} color="#94a3b8" />} label="رقم الهاتف" value={user?.phone} />
          <Divider />
          <InfoRow icon={<ShieldCheck size={18} color="#94a3b8" />} label="الصلاحية" value={ROLE_LABELS_AR[user?.role as keyof typeof ROLE_LABELS_AR] || "غير معروف"} />
        </View>

        <Pressable onPress={handleLogout} className="mt-8 flex-row items-center justify-center bg-red-50 py-4 rounded-2xl border border-red-100 active:bg-red-100">
          <LogOut size={18} color="#ef4444" />
          <Text className="text-red-500 font-black mr-2">تسجيل الخروج</Text>
        </Pressable>
      </View>

      {/* --- EDIT MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[90%]">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">تعديل الحساب</Text>
              <Pressable onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                <X size={20} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {/* Username Input */}
              <View className="items-end mb-4">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase">اسم المستخدم</Text>
                <View className="flex-row-reverse items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 w-full">
                  <User size={18} color="#94a3b8" />
                  <TextInput className="flex-1 py-4 px-3 text-right font-bold text-slate-700" value={form.username} onChangeText={(t) => setForm({...form, username: t})} />
                </View>
              </View>

              {/* Email Input */}
              <View className="items-end mb-4">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase">البريد الإلكتروني</Text>
                <View className="flex-row-reverse items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 w-full">
                  <Mail size={18} color="#94a3b8" />
                  <TextInput keyboardType="email-address" className="flex-1 py-4 px-3 text-right font-bold text-slate-700" value={form.email} onChangeText={(t) => setForm({...form, email: t})} />
                </View>
              </View>

              {/* Phone Input */}
              <View className="items-end mb-4">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase">رقم الهاتف</Text>
                <View className="flex-row-reverse items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 w-full">
                  <Phone size={18} color="#94a3b8" />
                  <TextInput keyboardType="phone-pad" className="flex-1 py-4 px-3 text-right font-bold text-slate-700" value={form.phone} onChangeText={(t) => setForm({...form, phone: t})} />
                </View>
              </View>

              {/* Password Inputs */}
              <View className="items-end mb-4">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase">كلمة المرور الحالية (مطلوب)</Text>
                <View className="flex-row-reverse items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 w-full">
                  <Lock size={18} color="#94a3b8" />
                  <TextInput secureTextEntry className="flex-1 py-4 px-3 text-right font-bold text-slate-700" placeholder="تأكيد الهوية" value={form.currentPassword} onChangeText={(t) => setForm({...form, currentPassword: t})} />
                </View>
              </View>

              <View className="items-end mb-4">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase">كلمة المرور الجديدة (اختياري)</Text>
                <View className="flex-row-reverse items-center bg-slate-50 rounded-2xl px-4 border border-slate-100 w-full">
                  <Lock size={18} color="#94a3b8" />
                  <TextInput secureTextEntry className="flex-1 py-4 px-3 text-right font-bold text-slate-700" placeholder="اتركها فارغة إذا لم تكن تريد التغيير" value={form.newPassword} onChangeText={(t) => setForm({...form, newPassword: t})} />
                </View>
              </View>

              <TouchableOpacity disabled={updating} onPress={handleUpdate} className="bg-[#1e293b] py-5 rounded-2xl items-center shadow-lg mt-4">
                {updating ? <ActivityIndicator color="white" /> : <Text className="text-white font-black">حفظ التغييرات</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text className="text-center text-slate-300 font-bold text-[10px] mt-10 uppercase tracking-widest pb-10">
         © 2026 Dhaman Logistics Solutions V{packageJson.version}
      </Text>
    </ScrollView>
  );
}

// Helper components remain the same...
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string; }) => (
  <View className="flex-row-reverse items-center justify-between py-2">
    <View className="flex-row-reverse items-center gap-3">
      <View className="bg-slate-50 p-2 rounded-xl">{icon}</View>
      <View>
        <Text className="text-slate-400 text-[10px] font-bold text-right uppercase">{label}</Text>
        <Text className="text-slate-700 font-bold text-sm text-right">{value}</Text>
      </View>
    </View>
  </View>
);
const Divider = () => <View className="h-[1px] bg-slate-50 my-2" />;