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
  RefreshControl, // Added this
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
} from "lucide-react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import api from "@/src/api/axios";
import { StatusBar } from "expo-status-bar";

export default function SupervisorDashboard() {
  const { user: supervisor } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<"orders" | "team">("orders");
  const [orders, setOrders] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Added this state

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "CONFIRMER",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint =
        activeTab === "orders" ? "/supervisor/orders" : "/supervisor/team";
      const { data } = await api.get(endpoint);
      activeTab === "orders" ? setOrders(data) : setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Added this function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    const endpoint =
      activeTab === "orders" ? "/supervisor/orders" : "/supervisor/team";
    try {
      const { data } = await api.get(endpoint);
      activeTab === "orders" ? setOrders(data) : setTeam(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
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
            <Package
              size={16}
              color={activeTab === "orders" ? "#0f172a" : "#94a3b8"}
            />
            <Text
              className={`font-black text-xs ${activeTab === "orders" ? "text-slate-900" : "text-slate-400"}`}
            >
              الطلبيات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("team")}
            className={`flex-1 py-3 rounded-xl flex-row-reverse justify-center items-center gap-2 ${activeTab === "team" ? "bg-white" : ""}`}
          >
            <Users
              size={16}
              color={activeTab === "team" ? "#0f172a" : "#94a3b8"}
            />
            <Text
              className={`font-black text-xs ${activeTab === "team" ? "text-slate-900" : "text-slate-400"}`}
            >
              فريق العمل
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        // Added the RefreshControl here
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0f172a" // iOS color
            colors={["#10b981"]} // Android color
          />
        }
      >
        {loading && !refreshing ? ( // Modified to show spinner only on initial load
          <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
        ) : activeTab === "orders" ? (
          /* ORDERS LIST */
          orders.map((order: any) => (
            <View
              key={order._id}
              className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100"
            >
              <View className="flex-row-reverse justify-between items-start mb-3">
                <View className="items-end">
                  <Text className="text-[10px] font-bold text-slate-400">
                    #{order._id.slice(-6)}
                  </Text>
                  <Text className="text-lg font-black text-slate-900">
                    {order.customerName}
                  </Text>
                </View>
                <View className="bg-emerald-50 px-3 py-1 rounded-full">
                  <Text className="text-emerald-600 text-[10px] font-black">
                    {order.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row-reverse items-center gap-2 mb-2">
                <MapPin size={14} color="#ef4444" />
                <Text className="text-slate-600 font-bold text-xs">
                  {order.wilaya} - {order.address}
                </Text>
              </View>
              <View className="bg-slate-50 p-3 rounded-2xl flex-row-reverse justify-between">
                <Text className="text-slate-900 font-black">
                  {order.totalAmount} دج
                </Text>
                <Text className="text-slate-400 text-xs font-bold">
                  المبلغ الإجمالي
                </Text>
              </View>
            </View>
          ))
        ) : (
          /* TEAM LIST */
          <View>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-emerald-500 py-4 rounded-2xl flex-row-reverse justify-center items-center gap-2 mb-6 shadow-lg shadow-emerald-500/30"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-black">إضافة موظف جديد</Text>
            </TouchableOpacity>

            {team.map((member: any) => (
              <View
                key={member._id}
                className="bg-white rounded-3xl p-4 mb-3 flex-row-reverse items-center shadow-sm border border-slate-100"
              >
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${member.role === "CONFIRMER" ? "bg-emerald-50" : "bg-blue-50"}`}
                >
                  {member.role === "CONFIRMER" ? (
                    <Headset size={24} color="#10b981" />
                  ) : (
                    <Truck size={24} color="#3b82f6" />
                  )}
                </View>
                <View className="flex-1 mr-4 items-end">
                  <Text className="text-slate-900 font-black">
                    {member.username}
                  </Text>
                  <Text className="text-slate-400 text-[10px] font-bold">
                    {member.role === "CONFIRMER" ? "موظفة تأكيد" : "سائق توصيل"}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Pencil size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900">
                حساب موظف جديد
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="اسم المستخدم"
              className="bg-slate-50 p-4 rounded-2xl text-right mb-3 font-bold"
              onChangeText={(t) => setFormData({ ...formData, username: t })}
            />
            <TextInput
              placeholder="رقم الهاتف"
              className="bg-slate-50 p-4 rounded-2xl text-right mb-3 font-bold"
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
            />
            <TouchableOpacity
              onPress={handleAddUser}
              className="bg-slate-900 py-5 rounded-3xl items-center mt-4"
            >
              <Text className="text-white font-black">حفظ البيانات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}