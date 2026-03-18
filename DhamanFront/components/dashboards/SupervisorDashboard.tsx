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
  Image,
} from "react-native";
import {
  Users,
  Package,
  ShieldCheck,
  MapPin,
  Truck,
  Headset,
  Plus,
  X,
  Pencil,
  Eye,
  EyeOff,
  ChevronDown,
  Phone,
  Mail,
  Trash2,
  UserX,
  UserPlus,
  XCircle,
} from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import api from "@/src/api/axios";
import { StatusBar } from "expo-status-bar";
import {
  addNewUser,
  getTeamMembers,
  desactivateUser,
  updateMember,
  activateUser,
} from "@/src/features/user/userActions";
import { geSupservisortOrders } from "@/src/features/orders/orderActions";
import {
  ORDER_STATUS_LABELS_AR,
  OrderStatusKey,
  ROLE_LABELS_AR,
} from "@/src/utils/utility";
import { WILAYAS } from "@/src/utils/wilayas";

export default function SupervisorDashboard() {
  const { user: supervisor } = useSelector((state: RootState) => state.auth);
  const { team, loading } = useSelector((state: RootState) => state.users);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<"orders" | "team">("orders");
  const [refreshing, setRefreshing] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Modal State for adding user
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showEditRolePicker, setShowEditRolePicker] = useState(false);
  const [showWilayaPicker, setShowWilayaPicker] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const filteredWilayas = WILAYAS.filter(
    (w) =>
      w.ar_name.includes(wilayaSearch) ||
      w.code.toString().includes(wilayaSearch),
  );
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "" as keyof typeof ROLE_LABELS_AR | "",
    wilaya: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === "orders") {
      await dispatch(geSupservisortOrders()).unwrap();
    } else {
      await dispatch(getTeamMembers()).unwrap();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "orders") {
      await dispatch(geSupservisortOrders());
    } else {
      await dispatch(getTeamMembers()).unwrap();
    }
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500";
      case "CANCELLED":
        return "bg-rose-500";
      case "POSTPONED":
        return "bg-blue-500";
      case "PENDING":
        return "bg-amber-500";
      default:
        return "bg-slate-400";
    }
  };

  const handleAddUser = async () => {
    const { username, email, password, confirmPassword, phone, role, wilaya } =
      formData;
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !role ||
      !wilaya
    ) {
      Alert.alert("تنبيه", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمة المرور غير متطابقة");
      return;
    }
    try {
      await dispatch(addNewUser({ formdata: formData })).unwrap();
      setShowModal(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "",
        wilaya: "",
      });
      Alert.alert("نجاح", "تم إضافة الموظف بنجاح");
    } catch (err: any) {
      Alert.alert("خطأ", err || "فشل في إضافة الموظف");
    }
  };

  const handleDesactivateUser = (memberId: string) => {
    Alert.alert("تعطيل المستخدم", "هل تريد تعطيل هذا المستخدم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تعطيل",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(desactivateUser({ id: memberId })).unwrap();
          } catch (err) {
            console.log("errorr " + err);
            Alert.alert("خطأ", "فشل تعطيل المستخدم");
          }
        },
      },
    ]);
  };
  const handleActivateUser = (memberId: string) => {
    Alert.alert("تفعيل المستخدم", "هل تريد تفعيل هذا المستخدم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تفعيل",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(activateUser({ id: memberId })).unwrap();
          } catch (err) {
            console.log("errorr " + err);
            Alert.alert("خطأ", "فشل تفعيل المستخدم");
          }
        },
      },
    ]);
  };

  const handleUpdateMember = async () => {
    try {

      await dispatch(
        updateMember({ id: editingMember.id, memberInfo: editingMember }),
      ).unwrap();
      setEditingMember(null);
      fetchData();
      Alert.alert("نجاح", "تم تحديث البيانات");
    } catch (err) {
      Alert.alert("خطأ", "فشل التحديث");
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
        ) : activeTab === "orders" ? (
          orders.map((order: any) => (
            <View
              key={order._id}
              className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100"
            >
              <View className="flex-row-reverse justify-between items-start mb-3">
                <View className="items-end">
                  <Text className="text-[10px] font-bold text-slate-400">
                    #{order.orderNumber || order._id.slice(-6)}
                  </Text>
                  <Text className="text-lg font-black text-slate-900">
                    {order.customerName}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setViewingOrder(order)}
                    className="bg-slate-50 p-2 rounded-xl border border-slate-100"
                  >
                    <Eye size={16} color="#64748b" />
                  </TouchableOpacity>
                  <View
                    className={`${getStatusStyle(order.status)} px-3 py-1 rounded-full`}
                  >
                    <Text className="text-white text-[10px] font-black">
                      {ORDER_STATUS_LABELS_AR[order.status as OrderStatusKey] ||
                        order.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-2 mb-2">
                <MapPin size={14} color="#ef4444" />
                <Text className="text-slate-600 font-bold text-xs">
                  {order.wilaya} - {order.address}
                </Text>
              </View>

              <View className="bg-slate-50 p-3 rounded-2xl flex-row-reverse justify-between items-center">
                <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                  <Text className="text-emerald-700 font-black text-[14px]">
                    {order.totalAmount} دج
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs font-bold">
                  المبلغ الإجمالي
                </Text>
              </View>
            </View>
          ))
        ) : (
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
                  className={`w-12 h-12 rounded-2xl items-center justify-center`}
                >
                  <View className="relative">
                    <Image
                      source={{
                        uri:
                          member.profileImageUrl ||
                          "https://via.placeholder.com/150",
                      }}
                      className="w-12 h-12 rounded-full border-4 border-white shadow-xl"
                    />

                    <View
                      className={`absolute bottom-1 right-1 ${member.isActive ? "bg-green-500" : "bg-red-500"} w-4 h-4 rounded-full border-2 border-white`}
                    />
                  </View>
                </View>
                <View className="flex-1 mr-4 items-end">
                  <Text className="text-slate-900 font-black">
                    {member.username}
                  </Text>
                  <Text className="text-slate-400 text-[10px] font-bold">
                    {ROLE_LABELS_AR[
                      member.role as keyof typeof ROLE_LABELS_AR
                    ] || member.role}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setViewingMember(member)}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <Eye size={18} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditingMember(member)}
                    className="p-2"
                  >
                    <Pencil size={18} color="#3b82f6" />
                  </TouchableOpacity>
                  {member.isActive ? (
                    <TouchableOpacity
                      onPress={() => handleDesactivateUser(member._id)}
                      className="p-2"
                    >
                      <UserX size={18} color="#ef4444" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleActivateUser(member._id)}
                      className="p-2"
                    >
                      <UserPlus size={18} color="#10b981" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- Edit Member Modal --- */}
      <Modal visible={!!editingMember} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900">
                تعديل بيانات الموظف
              </Text>
              <TouchableOpacity onPress={() => setEditingMember(null)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="اسم المستخدم"
              value={editingMember?.username}
              className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
              onChangeText={(t) =>
                setEditingMember({ ...editingMember, username: t })
              }
            />
            {/* Added Email Field Back Here */}
            <TextInput
              placeholder="البريد الالكتروني"
              value={editingMember?.email}
              keyboardType="email-address"
              className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
              onChangeText={(t) =>
                setEditingMember({ ...editingMember, email: t })
              }
            />
            <TextInput
              placeholder="رقم الهاتف"
              value={editingMember?.phone}
              keyboardType="phone-pad"
              className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
              onChangeText={(t) =>
                setEditingMember({ ...editingMember, phone: t })
              }
            />
            <TouchableOpacity
              onPress={() => setShowEditRolePicker(!showEditRolePicker)}
              className="bg-slate-50 p-4 rounded-2xl mb-6 flex-row-reverse justify-between items-center"
            >
              <Text className="font-bold text-slate-900">
                {editingMember?.role
                  ? ROLE_LABELS_AR[
                      editingMember.role as keyof typeof ROLE_LABELS_AR
                    ]
                  : "اختر الوظيفة"}
              </Text>
              <ChevronDown size={20} color="#94a3b8" />
            </TouchableOpacity>

            {showEditRolePicker && (
              <View className="bg-slate-100 rounded-2xl p-2 mb-3">
                {Object.entries(ROLE_LABELS_AR).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    className="p-3 border-b border-slate-200 last:border-0"
                    onPress={() => {
                      setEditingMember({ ...editingMember, role: key as any });
                      setShowEditRolePicker(false);
                    }}
                  >
                    <Text className="text-right font-bold text-slate-700">
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={handleUpdateMember}
              className="bg-slate-900 py-5 rounded-3xl items-center mb-10"
            >
              <Text className="text-white font-black">حفظ التعديلات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Team Member Details Modal --- */}
      <Modal
        visible={!!viewingMember}
        animationType="slide"
        transparent
        onRequestClose={() => setViewingMember(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[3rem] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-slate-900 text-xl font-black mb-6 ">
              بيانات الموظف
            </Text>

            <View className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
              <View className="flex-row-reverse items-center mb-4">
                <View className="bg-emerald-500/10 p-2 rounded-xl  mr-2">
                  <Users size={20} color="#10b981" />
                </View>
                <Text className="text-slate-800 font-black mr-3 flex-1 text-right">
                  {viewingMember?.username}
                </Text>
              </View>

              <View className="flex-row-reverse items-center mb-4">
                <View className="bg-blue-500/10 p-2 rounded-xl mr-2">
                  <Mail size={20} color="#3b82f6" />
                </View>
                <Text className="text-slate-600 font-bold mr-3 flex-1 text-right">
                  {viewingMember?.email}
                </Text>
              </View>

              <View className="flex-row-reverse items-center">
                <View className="bg-amber-500/10 p-2 rounded-xl mr-2">
                  <Phone size={20} color="#f59e0b" />
                </View>
                <Text className="text-slate-600 font-bold mr-3 flex-1 text-right">
                  {viewingMember?.phone || "غير متوفر"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setViewingMember(null)}
              className="bg-slate-900 py-4 rounded-2xl items-center mb-4"
            >
              <Text className="text-white font-black text-base">إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Order Details Modal --- */}
      <Modal
        visible={!!viewingOrder}
        animationType="slide"
        transparent
        onRequestClose={() => setViewingOrder(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[3rem] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-slate-900 text-xl font-black mb-6">
              تفاصيل الطلبية
            </Text>
            <View className="bg-slate-50 rounded-3xl p-5 mb-5 border border-slate-100">
              <View className="flex-row items-center mb-2">
                <Package size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">
                  قائمة المنتجات:
                </Text>
              </View>
              {viewingOrder?.items?.map((item: any, index: number) => (
                <View
                  key={index}
                  className={`flex-row justify-between items-center py-3 ${index !== viewingOrder.items.length - 1 ? "border-b border-slate-200/50" : ""}`}
                >
                  <Text className="text-slate-700 font-bold text-[16px] flex-1">
                    {item.productName}
                  </Text>
                  <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                    <Text className="text-emerald-700 font-black text-[14px]">
                      {item.priceAtTimeOfOrder} دج{" "}
                      <Text className="text-red-600">x{item.quantity}</Text>
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
              <View className="flex-row items-center mb-3">
                <MapPin size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">
                  معلومات التوصيل:
                </Text>
              </View>
              <Text className="text-slate-700 font-bold">
                الولاية: {viewingOrder?.wilaya}
              </Text>
              <Text className="text-slate-500 font-bold mt-1">
                العنوان: {viewingOrder?.address || "غير محدد"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setViewingOrder(null)}
              className="bg-slate-900 py-4 rounded-2xl items-center mb-4"
            >
              <Text className="text-white font-black text-base">إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wilaya Picker Modal */}
      <Modal visible={showWilayaPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[3rem] h-[80%] p-6">
            <View className="flex-row-reverse justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setShowWilayaPicker(false)}>
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
              <Text className="text-xl font-black">اختر الولاية</Text>
            </View>

            <TextInput
              placeholder="بحث عن ولاية..."
              className="bg-slate-100 p-4 rounded-2xl mb-4 text-right font-bold"
              value={wilayaSearch}
              onChangeText={setWilayaSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {filteredWilayas.map((wilaya) => (
                  <TouchableOpacity
                    key={wilaya.code}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        wilaya: wilaya.ar_name,
                      });
                      setShowWilayaPicker(false);
                      setWilayaSearch("");
                    }}
                    className={`w-[48%] p-4 mb-3 rounded-2xl border ${
                      formData.wilaya === wilaya.ar_name
                        ? "bg-emerald-50 border-emerald-500"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        formData.wilaya === wilaya.ar_name
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {wilaya.code} - {wilaya.ar_name}
                    </Text>
                    <Text className="text-center text-[10px] text-slate-400">
                      التوصيل: {wilaya.deliveryPrice} دج
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[90%]">
            <View className="flex-row-reverse justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900">
                حساب موظف جديد
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="اسم المستخدم"
                className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
                onChangeText={(t) => setFormData({ ...formData, username: t })}
              />
              <TextInput
                placeholder="البريد الالكتروني"
                keyboardType="email-address"
                className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
                onChangeText={(t) => setFormData({ ...formData, email: t })}
              />

              <View className="relative mb-3">
                <TextInput
                  placeholder="كلمة المرور"
                  secureTextEntry={!showPassword}
                  className="bg-slate-50 p-4 rounded-2xl font-bold text-right"
                  onChangeText={(t) =>
                    setFormData({ ...formData, password: t })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  className="absolute left-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="تاكيد كلمة المرور"
                secureTextEntry={!showPassword}
                className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
                onChangeText={(t) =>
                  setFormData({ ...formData, confirmPassword: t })
                }
              />

              <TextInput
                placeholder="رقم الهاتف"
                keyboardType="phone-pad"
                className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
                onChangeText={(t) => setFormData({ ...formData, phone: t })}
              />

              <View className="relative mb-3">
                <Text className="text-slate-400 font-bold mb-1">الولاية</Text>
                <TouchableOpacity
                  onPress={() => setShowWilayaPicker(true)}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3 flex-row-reverse justify-between items-center"
                >
                  <MapPin size={18} color="#64748b" />
                  <Text className="font-bold text-slate-700">
                    {formData.wilaya || "اختر الولاية"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Role Picker */}
              <TouchableOpacity
                onPress={() => setShowRolePicker(!showRolePicker)}
                className="bg-slate-50 p-4 rounded-2xl mb-3 flex-row-reverse justify-between items-center"
              >
                <Text
                  className={`font-bold ${formData.role ? "text-slate-900" : "text-slate-400"}`}
                >
                  {formData.role
                    ? ROLE_LABELS_AR[formData.role]
                    : "اختر الوظيفة"}
                </Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>

              {showRolePicker && (
                <View className="bg-slate-100 rounded-2xl p-2 mb-3">
                  {Object.entries(ROLE_LABELS_AR).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      className="p-3 border-b border-slate-200 last:border-0"
                      onPress={() => {
                        setFormData({ ...formData, role: key as any });
                        setShowRolePicker(false);
                      }}
                    >
                      <Text className="text-right font-bold text-slate-700">
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleAddUser}
                className="bg-slate-900 py-5 rounded-3xl items-center mt-4 mb-10"
              >
                <Text className="text-white font-black">حفظ البيانات</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
