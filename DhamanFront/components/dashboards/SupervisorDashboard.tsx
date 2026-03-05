import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Users,
  Package,
  ShieldCheck,
  MapPin,
  Phone,
  Truck,
  Headset,
  Lock,
  User,
  Plus,
  X,
  Pencil,
  Trash2,
  Eye, // Added Eye icon
} from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import api from "@/src/api/axios";
import { StatusBar } from "expo-status-bar";
import { getOrders, getTeamMembers } from "@/src/features/supervisor/supervisorActions";
import { ORDER_STATUS_LABELS_AR, OrderStatusKey } from "@/src/utils/utility"; // Import labels

export default function SupervisorDashboard() {
  const { user: supervisor } = useSelector((state: RootState) => state.auth);
  const { team, orders, loading } = useSelector((state: RootState) => state.supervisor);
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<"orders" | "team">("orders");
  const [refreshing, setRefreshing] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null); // Added state for Modal

  // Modal State for adding user
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === "orders") {
      await dispatch(getOrders()).unwrap();
    } else {
      await dispatch(getTeamMembers()).unwrap();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "orders") {
      await dispatch(getOrders());
    } else {
      await dispatch(getTeamMembers()).unwrap();
    }
    setRefreshing(false);
  };

  // Status Color Helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-emerald-500";
      case "CANCELLED": return "bg-rose-500";
      case "POSTPONED": return "bg-blue-500";
      case "PENDING": return "bg-amber-500";
      default: return "bg-slate-400";
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post("/supervisor/users", formData);
      setShowModal(false);
      fetchData();
      Alert.alert("نجاح", "تم إضافة الموظف بنجاح");
    } catch (err) {
      Alert.alert("خطأ", "فشل في إضافة الموظف");
    }
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ direction: "rtl" }}>
      <StatusBar style="light" />

      {/* Dark Header Card */}
      <View className="bg-slate-900 pt-16 pb-8 px-6 rounded-b-[40px] shadow-2xl">
        <View className="flex-row-reverse justify-between items-center mb-6">
          <View className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <ShieldCheck size={24} color="#10b981" />
          </View>
          <View className="">
            <Text className="text-emerald-400 text-[15px] font-black uppercase tracking-widest">
              مرحباً بك، {supervisor?.username || "المشرف"} 👋
            </Text>
            <Text className="text-white text-2xl font-black">
              لوحة تحكم المشرف
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row-reverse bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <TouchableOpacity
            onPress={() => setActiveTab("orders")}
            className={`flex-1 py-3 rounded-xl flex-row-reverse justify-center items-center gap-2 ${activeTab === "orders" ? "bg-white" : ""}`}
          >
            <Package size={16} color={activeTab === "orders" ? "#0f172a" : "#94a3b8"} />
            <Text className={`font-black text-xs ${activeTab === "orders" ? "text-slate-900" : "text-slate-400"}`}>الطلبيات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("team")}
            className={`flex-1 py-3 rounded-xl flex-row-reverse justify-center items-center gap-2 ${activeTab === "team" ? "bg-white" : ""}`}
          >
            <Users size={16} color={activeTab === "team" ? "#0f172a" : "#94a3b8"} />
            <Text className={`font-black text-xs ${activeTab === "team" ? "text-slate-900" : "text-slate-400"}`}>فريق العمل</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#10b981"]} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
        ) : activeTab === "orders" ? (
          orders.map((order: any) => (
            <View key={order._id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
              <View className="flex-row-reverse justify-between items-start mb-3">
                <View className="items-end">
                  <Text className="text-[10px] font-bold text-slate-400">#{order.orderNumber || order._id.slice(-6)}</Text>
                  <Text className="text-lg font-black text-slate-900">{order.customerName}</Text>
                </View>
                
                {/* Dynamic Status Color */}
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity 
                    onPress={() => setViewingOrder(order)}
                    className="bg-slate-50 p-2 rounded-xl border border-slate-100"
                  >
                    <Eye size={16} color="#64748b" />
                  </TouchableOpacity>
                  <View className={`${getStatusStyle(order.status)} px-3 py-1 rounded-full`}>
                    <Text className="text-white text-[10px] font-black">
                      {ORDER_STATUS_LABELS_AR[order.status as OrderStatusKey] || order.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-2">
                <MapPin size={14} color="#ef4444" />
                <Text className="text-slate-600 font-bold text-xs">{order.wilaya} - {order.address}</Text>
              </View>

              <View className="bg-slate-50 p-3 rounded-2xl flex-row-reverse justify-between items-center">
                  <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                    <Text className="text-emerald-700 font-black text-[14px]">{order.totalAmount} دج</Text>
                  </View>
                <Text className="text-slate-400 text-xs font-bold">المبلغ الإجمالي</Text>
              </View>
            </View>
          ))
        ) : (
          /* TEAM LIST CODE REMAINS THE SAME */
          <View>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-emerald-500 py-4 rounded-2xl flex-row-reverse justify-center items-center gap-2 mb-6 shadow-lg shadow-emerald-500/30"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-black">إضافة موظف جديد</Text>
            </TouchableOpacity>
            {team.map((member: any) => (
              <View key={member._id} className="bg-white rounded-3xl p-4 mb-3 flex-row-reverse items-center shadow-sm border border-slate-100">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${member.role === "CONFIRMER" ? "bg-emerald-50" : "bg-blue-50"}`}>
                  {member.role === "CONFIRMER" ? <Headset size={24} color="#10b981" /> : <Truck size={24} color="#3b82f6" />}
                </View>
                <View className="flex-1 mr-4 items-end">
                  <Text className="text-slate-900 font-black">{member.username}</Text>
                  <Text className="text-slate-400 text-[10px] font-bold">{member.role === "CONFIRMER" ? "موظفة تأكيد" : "سائق توصيل"}</Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Pencil size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- Order Details Modal --- */}
      <Modal visible={!!viewingOrder} animationType="slide" transparent onRequestClose={() => setViewingOrder(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[3rem] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-slate-900 text-xl font-black mb-6">تفاصيل الطلبية</Text>

            <View className="bg-slate-50 rounded-3xl p-5 mb-5 border border-slate-100">
              <View className="flex-row items-center mb-2">
                <Package size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">قائمة المنتجات:</Text>
              </View>
              {viewingOrder?.items?.map((item: any, index: number) => (
                <View key={index} className={`flex-row justify-between items-center py-3 ${index !== viewingOrder.items.length - 1 ? "border-b border-slate-200/50" : ""}`}>
                  <Text className="text-slate-700 font-bold text-[16px] flex-1">{item.productName}</Text>
                  <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                    <Text className="text-emerald-700 font-black text-[14px]">{item.priceAtTimeOfOrder} دج <Text className="text-red-600">x{item.quantity}</Text></Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
              <View className="flex-row items-center mb-3">
                <MapPin size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">معلومات التوصيل:</Text>
              </View>
              <Text className="text-slate-700 font-bold">الولاية: {viewingOrder?.wilaya}</Text>
              <Text className="text-slate-500 font-bold mt-1">العنوان: {viewingOrder?.address || "غير محدد"}</Text>
            </View>

            <TouchableOpacity onPress={() => setViewingOrder(null)} className="bg-slate-900 py-4 rounded-2xl items-center mb-4">
              <Text className="text-white font-black text-base">إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add User Modal Code Remains Unchanged */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900">حساب موظف جديد</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><X size={24} color="#0f172a" /></TouchableOpacity>
            </View>
            <TextInput placeholder="اسم المستخدم" className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold" onChangeText={(t) => setFormData({ ...formData, username: t })} />
            <TextInput placeholder="رقم الهاتف" className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold" onChangeText={(t) => setFormData({ ...formData, phone: t })} />
            <TouchableOpacity onPress={handleAddUser} className="bg-slate-900 py-5 rounded-3xl items-center mt-4">
              <Text className="text-white font-black">حفظ البيانات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}