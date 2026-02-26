import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Navigation,
  BellRing,
  LogOut,
  User,
  RefreshCw,
  RotateCcw,
  Package,
} from "lucide-react-native";
import { useSelector, useDispatch } from "react-redux";
import {  AppDispatch, RootState } from "@/src/store/store";
import { logout } from  "../../src/features/auth/authSlice";
import api from "@/src/api/axios";
import { StatusBar } from "expo-status-bar";
import { logoutUser } from "@/src/features/auth/authActions";
import { useRouter } from "expo-router";

export default function DriverDashboard() {
  const { user: driver } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDriverTasks();
  }, []);

  const fetchDriverTasks = async () => {
    try {
      setLoading(true);
      // Status is filtered on backend to OrderStatus.OUT_FOR_DELIVERY
      const { data } = await api.get("/driver/orders");
      setTasks(data);
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("خطأ", "تعذر جلب البيانات من الخادم");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverTasks();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/driver/orders/${orderId}/status`, {
        status: newStatus,
        note: "تحديث من قبل السائق عبر التطبيق",
      });
      Alert.alert("تم بنجاح", "تم تحديث حالة الطلبية");
      fetchDriverTasks();
    } catch (err) {
      Alert.alert("خطأ", "فشل في تحديث الحالة");
    }
  };

  const sendArrivalAlert = async (orderId: string) => {
    try {
      await api.patch(`/driver/orders/${orderId}/arrive`);
      Alert.alert("تنبيه", "تم إرسال تنبيه الوصول للمركز بنجاح");
      fetchDriverTasks();
    } catch (err) {
      Alert.alert("خطأ", "تعذر إرسال التنبيه");
    }
  };

  const openInMaps = (address: string, wilaya: string) => {
    const query = encodeURIComponent(`${address}, ${wilaya}, Algeria`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" />

      {/* --- HEADER --- */}
      <View className="bg-amber-500 pt-16 pb-8 px-6 rounded-b-[40px] shadow-lg">
        <View className="flex-row-reverse justify-between items-center mb-6">
          <View className="flex-row-reverse items-center gap-3">
            <View className="w-12 h-12 bg-slate-900/10 rounded-full items-center justify-center">
              <User size={24} color="#0f172a" />
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black text-slate-900/60 uppercase">
                مرحباً بالسائق
              </Text>
              <Text className="font-black text-slate-900 text-lg">
                {driver?.username || "كمال"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("خروج", "هل تريد تسجيل الخروج؟", [
                { text: "إلغاء", style: "cancel" },
                {
                  text: "خروج",
                  onPress: async () => {
                    await dispatch(logoutUser());
                    // clear tokens and state
                    dispatch(logout());
                    router.replace("/(auth)/login");
                  },
                },
              ])
            }
            className="bg-slate-900/10 p-3 rounded-2xl"
          >
            <LogOut size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View className="bg-slate-900 p-5 rounded-3xl flex-row-reverse justify-between items-center shadow-inner">
          <View className="items-end">
            <Text className="text-[10px] font-black text-slate-400 uppercase">
              المهام الجارية
            </Text>
            <Text className="text-2xl font-black text-amber-400">
              {tasks.length}
            </Text>
          </View>
          <View className="bg-white/10 p-3 rounded-2xl">
            <Truck size={28} color="#fbbf24" />
          </View>
        </View>
      </View>

      {/* --- TASKS LIST --- */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-right font-black text-slate-800 mb-4 px-2">
          قائمة التوصيل اليوم
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#fbbf24" className="mt-20" />
        ) : tasks.length === 0 ? (
          <View className="items-center mt-20">
            <Package size={50} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-4">
              لا توجد طلبيات مسندة حالياً
            </Text>
          </View>
        ) : (
          tasks.map((task: any) => (
            <View
              key={task._id}
              className="bg-white rounded-[35px] p-6 mb-4 shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <View className="absolute top-0 right-0 w-2 h-full bg-amber-500" />

              <View className="flex-row-reverse justify-between items-start mb-4">
                <View className="items-end flex-1 ml-4">
                  <View className="flex-row-reverse items-center gap-2">
                    <Text className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-black">
                      #{task._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {task.wilaya}
                    </Text>
                  </View>
                  <Text className="text-xl font-black text-slate-900 mt-2">
                    {task.customerName}
                  </Text>
                  <View className="flex-row-reverse items-center gap-1 mt-1">
                    <MapPin size={12} color="#fbbf24" />
                    <Text
                      className="text-slate-400 text-xs font-bold"
                      numberOfLines={1}
                    >
                      {task.address}
                    </Text>
                  </View>
                </View>
                <View className="bg-slate-50 p-3 rounded-2xl items-center border border-slate-100 min-w-[90px]">
                  <Text className="text-sm font-black text-slate-900">
                    {task.totalAmount} دج
                  </Text>
                  <Text className="text-[8px] font-bold text-slate-400 uppercase">
                    المبلغ
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row-reverse gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${task.customerPhone}`)}
                  className="flex-1 bg-emerald-600 flex-row-reverse items-center justify-center p-4 rounded-2xl gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Phone size={18} color="white" />
                  <Text className="text-white font-black text-xs">اتصال</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openInMaps(task.address, task.wilaya)}
                  className="flex-1 bg-slate-100 flex-row-reverse items-center justify-center p-4 rounded-2xl gap-2"
                >
                  <Navigation size={18} color="#64748b" />
                  <Text className="text-slate-600 font-black text-xs">
                    الخريطة
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Arrival Alert Button */}
              <TouchableOpacity
                disabled={task.deliveryNotificationSent}
                onPress={() => sendArrivalAlert(task._id)}
                className={`w-full py-3 rounded-2xl flex-row-reverse items-center justify-center gap-2 mb-4 border ${task.deliveryNotificationSent ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-100"}`}
              >
                <BellRing
                  size={16}
                  color={task.deliveryNotificationSent ? "#94a3b8" : "#d97706"}
                />
                <Text
                  className={`font-black text-[10px] ${task.deliveryNotificationSent ? "text-slate-400" : "text-amber-700"}`}
                >
                  {task.deliveryNotificationSent
                    ? "تم إرسال تنبيه الوصول"
                    : "أنا في الموقع (تنبيه)"}
                </Text>
              </TouchableOpacity>

              {/* Status Controls */}
              <View className="space-y-2">
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(task._id, "DELIVERED")}
                  className="bg-slate-900 w-full flex-row-reverse items-center justify-center p-4 rounded-2xl gap-3 shadow-xl shadow-slate-900/20"
                >
                  <CheckCircle2 size={20} color="#fbbf24" />
                  <Text className="text-white font-black">
                    تم التسليم بنجاح
                  </Text>
                </TouchableOpacity>

                <View className="flex-row-reverse gap-2">
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(task._id, "EXCHANGED")}
                    className="flex-1 bg-purple-50 border border-purple-100 p-3 rounded-2xl flex-row-reverse items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} color="#7e22ce" />
                    <Text className="text-purple-700 font-black text-[10px]">
                      تم التبديل
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(task._id, "RETURNED")}
                    className="flex-1 bg-orange-50 border border-orange-100 p-3 rounded-2xl flex-row-reverse items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} color="#c2410c" />
                    <Text className="text-orange-700 font-black text-[10px]">
                      تم الإرجاع
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => handleUpdateStatus(task._id, "CANCELLED")}
                  className="w-full items-center py-2"
                >
                  <Text className="text-rose-400 font-bold text-[10px]">
                    فشل التوصيل / إلغاء
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
