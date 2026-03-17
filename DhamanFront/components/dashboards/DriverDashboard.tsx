import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  Modal,
} from "react-native";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  BellRing,
  LogOut,
  User,
  RefreshCw,
  RotateCcw,
  Package,
  Calendar,
  ChevronDown,
} from "lucide-react-native";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import { logout } from "../../src/features/auth/authSlice";
import { StatusBar } from "expo-status-bar";
import { logoutUser } from "@/src/features/auth/authActions";
import { useRouter } from "expo-router";
import { 
  getDriverOrders, 
  sendArrivalNotification, 
  updateOrderStatusByDriver 
} from "@/src/features/orders/orderActions";
import { ORDER_STATUS_LABELS_AR, OrderStatusKey, TAX_RATE } from "@/src/utils/utility";

// Define the filter types
type FilterPeriod = "today" | "lastMonth" | "lastSixMonths" | "lastYear";

export default function DriverDashboard() {
  const { user: driver } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  
  // New States for Filtering
  const [period, setPeriod] = useState<FilterPeriod>("today");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    fetchDriverorders();
  }, []);

  const fetchDriverorders = async () => {
    try {
      setLoading(true);
      await dispatch(getDriverOrders()).unwrap();
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("خطأ", "تعذر جلب البيانات من الخادم");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverorders();
    setRefreshing(false);
  };

  // --- EARNINGS CALCULATION LOGIC ---
  const earnings = useMemo(() => {
    const now = new Date();
    
    return orders
      .filter((order: any) => {
        if (order.status !== "DELIVERED") return false;
        
        const orderDate = new Date(order.updatedAt || order.createdAt);
        
        switch (period) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "lastMonth":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return orderDate >= monthAgo;
          case "lastSixMonths":
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            return orderDate >= sixMonthsAgo;
          case "lastYear":
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            return orderDate >= yearAgo;
          default:
            return false;
        }
      })
      .reduce((acc: number, curr: any) => {
        const deliveryPrice = curr.deliveryPrice || 0;
        const driverShare = deliveryPrice * (1 - TAX_RATE);
        return acc + driverShare;
      }, 0);
  }, [orders, period]);

  const activeOrders = orders.filter((o: any) => 
    ["CONFIRMED", "OUT_FOR_DELIVERY", "POSTPONED"].includes(o.status)
  );
  
  const historyOrders = orders.filter((o: any) => 
    ["DELIVERED", "CANCELLED", "RETURNED", "EXCHANGED"].includes(o.status)
  );

  const displayedOrders = activeTab === "active" ? activeOrders : historyOrders;

  const getPeriodLabel = (p: FilterPeriod) => {
    switch(p) {
      case "today": return "اليوم";
      case "lastMonth": return "آخر شهر ";
      case "lastSixMonths": return "آخر 6 أشهر";
      case "lastYear": return "آخر سنة";
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const statusLabel = ORDER_STATUS_LABELS_AR[newStatus as OrderStatusKey] || newStatus;

    Alert.alert(
      "تأكيد الحالة",
      `هل أنت متأكد من تغيير حالة الطلبية إلى: ${statusLabel}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          style: "default",
          onPress: async () => {
            try {
              await dispatch(updateOrderStatusByDriver({ id: orderId, status: newStatus })).unwrap();
              Alert.alert("تم بنجاح", "تم تحديث حالة الطلبية");
            } catch (err) {
              Alert.alert("خطأ", "فشل في تحديث الحالة");
            }
          },
        },
      ]
    );
  };

  const sendArrivalAlert = (orderId: string) => {
    Alert.alert(
      "تنبيه الوصول",
      "هل تريد إرسال تنبيه للمركز بأنك وصلت للموقع؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إرسال",
          onPress: async () => {
            try {
              await dispatch(sendArrivalNotification({ id: orderId })).unwrap();
              Alert.alert("تنبيه", "تم إرسال تنبيه الوصول للمركز بنجاح");
            } catch (err) {
              Alert.alert("خطأ", "تعذر إرسال التنبيه");
            }
          },
        },
      ]
    );
  };

  const openInMaps = (address: string, wilaya: string) => {
    const query = encodeURIComponent(`${address}, ${wilaya}, Algeria`);
    Linking.openURL(`http://maps.google.com/?q=${query}`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" />

      {/* --- HEADER --- */}
      <View className="bg-amber-500 pt-16 pb-4 px-6 rounded-b-[40px] shadow-lg">
        <View className="flex-row-reverse justify-between items-center mb-6">
          <View className="flex-row-reverse items-center gap-3">
            <View className="w-12 h-12 bg-slate-900/10 rounded-full items-center justify-center">
              <User size={24} color="#0f172a" />
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black text-slate-900/60 uppercase">مرحباً</Text>
              <Text className="font-black text-slate-900 text-lg">{driver?.username || "كمال"}</Text>
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

        {/* --- EARNINGS CARD --- */}
        <View className="bg-slate-900 p-5 rounded-3xl shadow-inner mb-4">
          <View className="flex-row-reverse justify-between items-center mb-3">
            <View className="items-end">
              <Text className="text-[10px] font-black text-slate-400 uppercase">
                أرباحك ({getPeriodLabel(period)})
              </Text>
              <Text className="text-2xl font-black text-emerald-400">
                {earnings.toLocaleString()} <Text className="text-xs">دج</Text>
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(true)}
              className="bg-white/10 px-3 py-2 rounded-xl flex-row-reverse items-center gap-2 border border-white/5"
            >
              <Calendar size={14} color="#fbbf24" />
              <Text className="text-white font-bold text-[10px]">{getPeriodLabel(period)}</Text>
              <ChevronDown size={14} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="h-[1px] bg-white/5 w-full mb-3" />
          
          <View className="flex-row-reverse justify-between items-center">
             <View className="items-end">
                <Text className="text-[10px] font-black text-slate-400 uppercase">المهام النشطة</Text>
                <Text className="text-xl font-black text-amber-400">{activeOrders.length}</Text>
             </View>
             <View className="bg-white/10 p-2 rounded-xl">
               <Truck size={20} color="#fbbf24" />
             </View>
          </View>
        </View>

        <View className="flex-row-reverse bg-slate-900/10 p-1 rounded-2xl">
          <TouchableOpacity 
            onPress={() => setActiveTab("active")}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === "active" ? "bg-slate-900" : ""}`}
          >
            <Text className={`font-black text-xs ${activeTab === "active" ? "text-amber-400" : "text-slate-900"}`}>المهام الحالية</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === "history" ? "bg-slate-900" : ""}`}
          >
            <Text className={`font-black text-xs ${activeTab === "history" ? "text-amber-400" : "text-slate-900"}`}>السجل</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-right font-black text-slate-800 mb-4 px-2">
          {activeTab === "active" ? "قائمة التوصيل اليوم" : "الطلبيات السابقة"}
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#fbbf24" className="mt-20" />
        ) : displayedOrders.length === 0 ? (
          <View className="items-center mt-20">
            <Package size={50} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold mt-4">{activeTab === "active" ? "لا توجد طلبيات مسندة حالياً" : "سجل الطلبيات فارغ"}</Text>
          </View>
        ) : (
          displayedOrders.map((order: any) => (
            <View key={order._id} className="bg-white rounded-[35px] p-6 mb-4 shadow-sm border border-slate-100 relative overflow-hidden">
              <View className={`absolute top-0 right-0 w-2 h-full ${activeTab === "active" ? "bg-amber-500" : "bg-slate-400"}`} />
              
              <View className="flex-row-reverse justify-between items-start mb-4">
                <View className="items-end flex-1 ml-4">
                  <View className="flex-row-reverse items-center gap-2">
                    <Text className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-black">#{order._id.slice(-6).toUpperCase()}</Text>
                    <Text className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{order.wilaya}</Text>
                  </View>
                  <View className={`px-4 py-1.5 rounded-full mt-2 ${order.status === "CONFIRMED" || order.status === "DELIVERED" ? "bg-emerald-500" : order.status === "CANCELLED" || order.status === "RETURNED" ? "bg-rose-500" : order.status === "POSTPONED" ? "bg-blue-500" : "bg-amber-500"}`}>
                    <Text className="text-[10px] font-black uppercase text-white">{ORDER_STATUS_LABELS_AR[order.status as OrderStatusKey] || order.status}</Text>
                  </View>
                  <Text className="text-xl font-black text-slate-900 mt-2">{order.customerName}</Text>
                  <View className="flex-row-reverse items-center gap-1 mt-1">
                    <MapPin size={12} color="#fbbf24" /><Text className="text-slate-400 text-xs font-bold" numberOfLines={1}>{order.address}</Text>
                  </View>
                </View>

                <View className="bg-slate-50 p-3 rounded-2xl items-center border border-slate-100 min-w-[100px]">
                  <Text className="text-sm font-black text-slate-900">{order.totalAmount} دج</Text>
                  <Text className="text-[8px] font-bold text-slate-400 uppercase">المجموع الكلي</Text>
                  
                  <View className="mt-1 pt-1 border-t border-slate-200 w-full items-center">
                    <Text className="text-[8px] font-black text-emerald-600">
                      حقوقك: {order.deliveryPrice * (1 - TAX_RATE)} دج
                    </Text>
                  </View>
                </View>
              </View>

              {activeTab === "active" && (
                <>
                  <View className="flex-row-reverse gap-2 mb-3">
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customerPhone}`)} className="flex-1 bg-emerald-600 flex-row-reverse items-center justify-center p-4 rounded-2xl gap-2 shadow-lg shadow-emerald-600/20">
                      <Phone size={18} color="white" /><Text className="text-white font-black text-xs">اتصال</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openInMaps(order.address, order.wilaya)} className="flex-1 bg-slate-100 flex-row-reverse items-center justify-center p-4 rounded-2xl gap-2">
                      <Navigation size={18} color="#64748b" /><Text className="text-slate-600 font-black text-xs">الخريطة</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity disabled={order.deliveryNotificationSent} onPress={() => sendArrivalAlert(order._id)} className={`w-full py-3 rounded-2xl flex-row-reverse items-center justify-center gap-2 mb-4 border ${order.deliveryNotificationSent ? "bg-slate-50 border-slate-200" : "bg-amber-50 border-amber-100"}`}>
                    <BellRing size={16} color={order.deliveryNotificationSent ? "#94a3b8" : "#d97706"} />
                    <Text className={`font-black text-[10px] ${order.deliveryNotificationSent ? "text-slate-400" : "text-amber-700"}`}>{order.deliveryNotificationSent ? "تم إرسال تنبيه الوصول" : "أنا في الموقع (تنبيه)"}</Text>
                  </TouchableOpacity>

                  <View className="space-y-2">
                    <TouchableOpacity onPress={() => handleUpdateStatus(order._id, "DELIVERED")} className="bg-slate-900 w-full flex-row-reverse items-center justify-center p-4 rounded-2xl gap-3 shadow-xl shadow-slate-900/20">
                      <CheckCircle2 size={20} color="#fbbf24" /><Text className="text-white font-black">تم التسليم بنجاح</Text>
                    </TouchableOpacity>
                    <View className="flex-row-reverse mt-4 gap-2">
                      <TouchableOpacity onPress={() => handleUpdateStatus(order._id, "EXCHANGED")} className="flex-1 bg-purple-50 border border-purple-100 p-3 rounded-2xl flex-row-reverse items-center justify-center gap-2">
                        <RefreshCw size={14} color="#7e22ce" /><Text className="text-purple-700 font-black text-[10px]">تم التبديل</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleUpdateStatus(order._id, "RETURNED")} className="flex-1 bg-orange-50 border border-orange-100 p-3 rounded-2xl flex-row-reverse items-center justify-center gap-2">
                        <RotateCcw size={14} color="#c2410c" /><Text className="text-orange-700 font-black text-[10px]">تم الإرجاع</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => handleUpdateStatus(order._id, "CANCELLED")} className="w-full items-center py-2 mt-2">
                      <Text className="text-rose-400 font-bold text-[10px]">فشل التوصيل / إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* --- FILTER MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setFilterModalVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-[40px] p-8">
            <Text className="text-right font-black text-lg mb-6 text-slate-900">اختر الفترة</Text>
            
            {(["today", "lastMonth", "lastSixMonths", "lastYear"] as FilterPeriod[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPeriod(p);
                  setFilterModalVisible(false);
                }}
                className={`mb-3 p-5 rounded-2xl flex-row-reverse justify-between items-center ${period === p ? "bg-amber-500" : "bg-slate-50"}`}
              >
                <Text className={`font-black ${period === p ? "text-white" : "text-slate-600"}`}>
                  {getPeriodLabel(p)}
                </Text>
                {period === p && <CheckCircle2 size={20} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}