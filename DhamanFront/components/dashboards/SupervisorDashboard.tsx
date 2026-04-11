import { geSupservisortOrders } from "@/src/features/orders/orderActions";
import {
  addProduct,
  getSupervisorProducts,
  ProductInsertBody,
} from "@/src/features/products/productActions";
import {
  activateUser,
  addNewUser,
  desactivateUser,
  getTeamMembers,
  updateMember,
} from "@/src/features/user/userActions";
import { AppDispatch, RootState } from "@/src/store/store";
import {
  ORDER_STATUS_LABELS_AR,
  OrderStatusKey,
  ROLE_LABELS_AR,
} from "@/src/utils/utility";
import { WILAYAS } from "@/src/utils/wilayas";
import { StatusBar } from "expo-status-bar";
import {
  Car,
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function SupervisorDashboard() {
  const { user: supervisor } = useSelector((state: RootState) => state.auth);
  const { team, loading } = useSelector((state: RootState) => state.users);
  const { products, loadingAddingProduct } = useSelector(
    (state: RootState) => state.products,
  );
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState<"orders" | "team" | "products">(
    "orders",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Modal State for adding user
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    basePrice: "",
    stockQuantity: "",
    category: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showEditRolePicker, setShowEditRolePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWilayaPicker, setShowWilayaPicker] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState("");

  const filteredWilayas = WILAYAS.filter(
    (w) =>
      w.ar_name.includes(wilayaSearch) ||
      w.code.toString().includes(wilayaSearch),
  );
  const itemsPerPage = 6; // How many products to show at once
  // Logic to get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "" as keyof typeof ROLE_LABELS_AR | "",
    wilaya: "",
    Car_Id: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === "orders") {
      await dispatch(geSupservisortOrders()).unwrap();
    } else if (activeTab === "team") {
      await dispatch(getTeamMembers()).unwrap();
    } else if (activeTab === "products") {
      await dispatch(getSupervisorProducts()).unwrap();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "orders") {
      await dispatch(geSupservisortOrders());
    } else if (activeTab === "team") {
      await dispatch(getTeamMembers()).unwrap();
    } else if (activeTab === "products") {
      await dispatch(getSupervisorProducts()).unwrap();
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
        Car_Id: "",
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
        updateMember({ id: editingMember._id, memberInfo: editingMember }),
      ).unwrap();
      setEditingMember(null);
      fetchData();
      Alert.alert("نجاح", "تم تحديث البيانات");
    } catch (err) {
      Alert.alert("خطأ", "فشل التحديث");
    }
  };

  const handleAddProduct = async () => {
    // Simple validation to ensure required fields aren't empty
    if (!productForm.name || !productForm.sku || !productForm.basePrice) {
      Alert.alert("تنبيه", "يرجى ملء الحقول الأساسية");
      return;
    }

    try {
      // Convert strings from TextInput to Numbers for the API
      const productData: ProductInsertBody = {
        name: productForm.name,
        sku: productForm.sku.toUpperCase(), // Best practice for SKUs
        basePrice: Number(productForm.basePrice),
        stockQuantity: Number(productForm.stockQuantity) || 0,
        category: productForm.category,
      };

      await dispatch(addProduct({ formdata: productData })).unwrap();

      Alert.alert("نجاح", "تمت إضافة المنتج بنجاح");

      // Reset form and close modal
      setProductForm({
        name: "",
        sku: "",
        basePrice: "",
        stockQuantity: "",
        category: "",
      });
      setShowProductModal(false);
      setCurrentPage(1); // Go to page 1 to see the new product
    } catch (error) {
      Alert.alert(
        "خطأ",
        typeof error === "string" ? error : "فشل في إضافة المنتج",
      );
    }
  };
  // --- Statistics Logic ---
  const stats = {
    total: orders.length,
    confirmed: orders.filter((o: any) => o.status === "CONFIRMED").length,
    cancelled: orders.filter((o: any) => o.status === "CANCELLED").length,
    pending: orders.filter((o: any) => o.status === "PENDING").length,
    delivered: orders.filter((o: any) => o.status === "DELIVERED").length,
    // Calculate total revenue from delivered orders
    totalRevenue: orders
      .filter((o: any) => o.status === "DELIVERED")
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
  };

  // Calculate percentages for the progress bars
  const cancellationRate =
    stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0;
  const confirmationRate =
    stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;

  const StatCard = ({ label, value, color, icon: Icon }: any) => (
    <View className="flex items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-1 m-1">
      <View
        className={`w-8 h-8 rounded-xl ${color} items-center justify-center mb-2`}
      >
        <Icon size={16} color="white" />
      </View>
      <Text className="text-slate-400 text-[10px] font-black mb-1">
        {label}
      </Text>
      <Text className="text-slate-900 text-lg font-black">{value}</Text>
    </View>
  );

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

          <TouchableOpacity
            onPress={() => setActiveTab("products")}
            className={`flex-1 py-3 rounded-xl flex-row-reverse justify-center items-center gap-2 ${activeTab === "products" ? "bg-white" : ""}`}
          >
            <Package
              size={16}
              color={activeTab === "products" ? "#0f172a" : "#94a3b8"}
            />
            <Text
              className={`font-black text-xs ${activeTab === "products" ? "text-slate-900" : "text-slate-400"}`}
            >
              المنتجات
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
        {/* 1. Statistics Cards Grid */}
        <View className="flex-row flex-wrap mb-2">
          <StatCard
            label="المجموع"
            value={stats.total}
            color="bg-slate-800"
            icon={Package}
          />
          <StatCard
            label="ملغاة"
            value={stats.cancelled}
            color="bg-rose-500"
            icon={XCircle}
          />
          <StatCard
            label="مؤكدة"
            value={stats.confirmed}
            color="bg-emerald-500"
            icon={ShieldCheck}
          />
          <StatCard
            label="معلقة"
            value={stats.pending}
            color="bg-amber-500"
            icon={ActivityIndicator}
          />
        </View>

        {/* 2. Progress Visualizer */}
        <View className="bg-white p-5 rounded-[32px] mb-6 border border-slate-100 shadow-sm mx-1">
          <Text className="text-slate-900 font-black mb-4  text-xs">
            تحليل الأداء العام
          </Text>
          <View className="mb-4">
            <View className="flex-row-reverse justify-between mb-1">
              <Text className="text-slate-400 text-[10px] font-bold">
                نسبة التأكيد
              </Text>
              <Text className="text-emerald-600 text-[10px] font-black">
                {confirmationRate.toFixed(1)}%
              </Text>
            </View>
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View
                style={{ width: `${confirmationRate}%` }}
                className="h-full bg-emerald-500"
              />
            </View>
          </View>
          <View>
            <View className="flex-row-reverse justify-between mb-1">
              <Text className="text-slate-400 text-[10px] font-bold">
                نسبة الإلغاء
              </Text>
              <Text className="text-rose-600 text-[10px] font-black">
                {cancellationRate.toFixed(1)}%
              </Text>
            </View>
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View
                style={{ width: `${cancellationRate}%` }}
                className="h-full bg-rose-500"
              />
            </View>
          </View>
        </View>

        <Text className="text-slate-400 font-black mb-4 mr-2  text-xs">
          آخر الطلبيات
        </Text>
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
        ) : activeTab === "products" ? (
          <View>
            <TouchableOpacity
              onPress={() => setShowProductModal(true)}
              className="bg-slate-900 py-4 rounded-2xl flex-row-reverse justify-center items-center gap-2 mb-6 shadow-lg shadow-emerald-500/10"
            >
              <Plus size={20} color="#10b981" />
              <Text className="text-white font-black">إضافة منتج جديد</Text>
            </TouchableOpacity>

            {products.length === 0 ? (
              <View className="bg-white rounded-[32px] p-12 items-center border border-dashed border-slate-200">
                <Package size={48} color="#cbd5e1" />
                <Text className="text-slate-400 font-bold mt-4 text-center">
                  لا توجد منتجات حالياً
                </Text>
              </View>
            ) : (
              <>
                {/* Products Grid */}
                <View className="flex-row flex-wrap justify-between">
                  {currentProducts.map((product: any) => (
                    <View
                      key={product._id}
                      className="w-[48%] bg-white rounded-[24px] p-4 mb-4 border border-slate-100 shadow-sm"
                    >
                      <View className="bg-slate-50 w-10 h-10 rounded-xl items-center justify-center mb-3">
                        <Package size={20} color="#64748b" />
                      </View>

                      <View className="flex ">
                        <Text
                          className="text-slate-900 font-black text-sm mb-1"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>

                        <Text className="text-slate-400 text-[10px] font-bold mb-3">
                          {product.sku}
                        </Text>
                      </View>

                      <View className="flex-row-reverse justify-between items-center pt-3 border-t border-slate-50">
                        <Text className="text-emerald-600 font-black text-xs">
                          {product.basePrice} دج
                        </Text>
                        <View className="bg-slate-100 px-2 py-1 rounded-md">
                          <Text className="text-slate-600 font-bold text-[9px]">
                            📦 {product.stockQuantity}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <View className="flex-row justify-center items-center gap-4 mt-4 mb-10">
                    <TouchableOpacity
                      disabled={currentPage === totalPages}
                      onPress={() => setCurrentPage((prev) => prev + 1)}
                      className={`p-3 rounded-xl ${currentPage === totalPages ? "bg-slate-100" : "bg-white border border-slate-200"}`}
                    >
                      <Text
                        className={
                          currentPage === totalPages
                            ? "text-slate-300"
                            : "text-slate-900"
                        }
                      >
                        التالي
                      </Text>
                    </TouchableOpacity>

                    <Text className="font-black text-slate-500">
                      {currentPage} / {totalPages}
                    </Text>

                    <TouchableOpacity
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage((prev) => prev - 1)}
                      className={`p-3 rounded-xl ${currentPage === 1 ? "bg-slate-100" : "bg-white border border-slate-200"}`}
                    >
                      <Text
                        className={
                          currentPage === 1
                            ? "text-slate-300"
                            : "text-slate-900"
                        }
                      >
                        السابق
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
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
            <View className="flex-row justify-between items-center mb-6">
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

            <View className="relative mb-3">
              <TouchableOpacity
                onPress={() => setShowWilayaPicker(true)}
                className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3 flex-row-reverse justify-between items-center"
              >
                <MapPin size={18} color="#64748b" />
                <Text className="font-bold text-slate-700">
                  {editingMember?.wilaya || "اختر الولاية"}
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* in case is a driver he can edit the car_id just an input field */}
            {editingMember?.role === "DRIVER" && (
              <TextInput
                placeholder="رقم السيارة"
                value={editingMember?.Car_Id}
                className="bg-slate-50 p-4 rounded-2xl mb-3 font-bold text-right"
                onChangeText={(t) =>
                  setEditingMember({ ...editingMember, car_id: t })
                }
              />
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

              <View className="flex-row-reverse items-center mb-4">
                <View className="bg-amber-500/10 p-2 rounded-xl mr-2">
                  <Phone size={20} color="#f59e0b" />
                </View>
                <Text className="text-slate-600 font-bold mr-3 flex-1 text-right">
                  {viewingMember?.phone || "غير متوفر"}
                </Text>
              </View>

              <View className="flex-row-reverse items-center">
                <View className="bg-amber-500/10 p-2 rounded-xl mr-2">
                  <Car size={20} color="#10b981" />
                </View>
                <Text className="text-slate-600 font-bold mr-3 flex-1 text-right">
                  {viewingMember?.Car_Id || "غير متوفر"}
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

      <Modal
        visible={!!viewingOrder}
        animationType="slide"
        transparent
        onRequestClose={() => setViewingOrder(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[3rem] p-6 shadow-2xl h-[90%]">
            {/* Handle Bar */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header: Order Number & Status (RTL) */}
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <Text className="text-slate-400 text-xl font-bold">
                    رقم الطلبية:
                  </Text>
                  <Text className="text-slate-900 text-xl font-black">
                    #{viewingOrder?.orderNumber}
                  </Text>
                </View>
              </View>

              {/* Section 1: Customer Details (RTL) */}
              <View className="bg-slate-50 rounded-[2rem] p-5 mb-4 border border-slate-100">
                <View className="flex-row items-center mb-4">
                  <Text className="text-slate-800 font-black mr-3 text-lg">
                    بيانات الزبون
                  </Text>
                </View>

                <View className="px-2">
                  <Text className="text-slate-900 text-xl font-bold mb-3">
                    {viewingOrder?.customerName}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${viewingOrder?.customerPhone}`)
                    }
                    className="flex-row items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 w-full justify-center"
                  >
                    <Text className="text-emerald-600 font-black ml-3 text-lg">
                      {viewingOrder?.customerPhone}
                    </Text>
                    <Phone size={20} color="#10b981" />
                  </TouchableOpacity>
                </View>

                <View className="mt-4 px-2">
                  <Text className="text-slate-900 text-xl font-bold mb-3">
                    {"ملاحظات الزبون:"}
                  </Text>
                  <Text className="text-emerald-600 font-black ml-3 text-lg">
                    {viewingOrder?.notes}
                  </Text>
                </View>
              </View>

              {/* Section 2: Items List (RTL) */}
              <View className="bg-slate-50 rounded-[2rem] p-5 mb-4 border border-slate-100">
                <View className="flex-row items-center mb-4">
                  <View className="bg-blue-500/10 p-2 rounded-lg">
                    <Package size={18} color="#3b82f6" />
                  </View>
                  <Text className="text-slate-800 font-black mr-3 text-lg">
                    قائمة المنتجات
                  </Text>
                </View>

                {viewingOrder?.items?.map((item: any, index: number) => (
                  <View
                    key={index}
                    className={`flex-row-reverse justify-between items-center py-4 ${index !== viewingOrder.items.length - 1 ? "border-b border-slate-200/50" : ""}`}
                  >
                    <View className="items-end flex-1 mr-3">
                      <Text className="text-slate-800 font-bold text-base text-right">
                        {item.productName}
                      </Text>
                      <Text className="text-slate-400 text-xs text-right">
                        {item.priceAtTimeOfOrder} دج للمنتج
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-slate-900 font-black text-base">
                        {item.priceAtTimeOfOrder * item.quantity} دج
                      </Text>
                      <View className="bg-slate-200 px-2 py-1 rounded-md ml-3">
                        <Text className="text-slate-700 font-bold text-xs">
                          x{item.quantity}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Section 3: Shipping & Time (RTL) */}
              <View className="bg-slate-50 rounded-[2rem] p-5 mb-4 border border-slate-100">
                <View className="flex-row items-center mb-4">
                  <View className="bg-rose-500/10 p-2 rounded-lg">
                    <MapPin size={18} color="#f43f5e" />
                  </View>
                  <Text className="text-slate-800 font-black mr-3 text-lg">
                    معلومات التوصيل والوقت
                  </Text>
                </View>
                <View className="items-end px-2 space-y-3">
                  <View className="flex-row justify-between w-full">
                    <Text className="text-slate-400">الولاية:</Text>
                    <Text className="text-slate-800 font-bold">
                      {viewingOrder?.wilaya}
                    </Text>
                  </View>
                  <View className="flex-row justify-between w-full">
                    <Text className="text-slate-400">العنوان:</Text>
                    <Text className="text-slate-800 font-bold text-right">
                      {viewingOrder?.address || "غير محدد"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between w-full pt-3 border-t border-slate-200">
                    <Text className="text-slate-400">تاريخ الإنشاء:</Text>
                    <Text className="text-slate-600 text-xs font-bold">
                      {new Date(viewingOrder?.createdAt).toLocaleDateString(
                        "ar-DZ",
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Section 4: Price Summary (Arabic Styled) */}
              <View className="bg-slate-900 rounded-[2rem] p-6 mb-8 shadow-xl">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-slate-400">سعر السلع:</Text>
                  <Text className="text-white font-bold">
                    {viewingOrder?.totalAmount -
                      (viewingOrder?.deliveryPrice || 0)}{" "}
                    دج
                  </Text>
                </View>
                <View className="flex-row justify-between mb-4 pb-4 border-b border-white/10">
                  <Text className="text-slate-400">تكلفة التوصيل:</Text>
                  <Text className="text-emerald-400 font-bold">
                    {viewingOrder?.deliveryPrice || 0} دج
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white font-black text-xl">
                    المبلغ الإجمالي:
                  </Text>
                  <Text className="text-emerald-400 font-black text-2xl">
                    {viewingOrder?.totalAmount} دج
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions (RTL) */}
            <View className="flex-row-reverse gap-3">
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${viewingOrder?.customerPhone}`)
                }
                className="flex-[2] bg-emerald-500 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Text className="text-white font-black text-lg ml-2">
                  إتصال بالزبون
                </Text>
                <Phone size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewingOrder(null)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center justify-center"
              >
                <Text className="text-slate-900 font-black">إغلاق</Text>
              </TouchableOpacity>
            </View>
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
                      if (editingMember) {
                        setEditingMember({
                          ...editingMember,
                          wilaya: wilaya.ar_name,
                        });
                      } else {
                        setFormData({ ...formData, wilaya: wilaya.ar_name });
                      }
                      setShowWilayaPicker(false);
                      setWilayaSearch("");
                    }}
                    className={`w-[48%] p-4 mb-3 rounded-2xl border ${
                      (
                        editingMember
                          ? editingMember.wilaya === wilaya.ar_name
                          : formData.wilaya === wilaya.ar_name
                      )
                        ? "bg-emerald-50 border-emerald-500"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-center font-bold ${
                        (
                          editingMember
                            ? editingMember.wilaya === wilaya.ar_name
                            : formData.wilaya === wilaya.ar_name
                        )
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      {wilaya.code} - {wilaya.ar_name}
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
            <View className="flex-row justify-between items-center mb-6">
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

              {/* New Step: Conditional Car ID */}
              {formData.role === "DRIVER" && (
                <View>
                  <Text className="text-slate-400 font-bold mb-1 mr-2">
                    معلومات المركبة
                  </Text>
                  <TextInput
                    placeholder="رقم السيارة"
                    className="bg-emerald-50 p-4 rounded-2xl mb-3 font-bold text-right border border-emerald-100"
                    onChangeText={(t) => setFormData({ ...formData, Car_I: t })}
                  />
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

      {/* --- Add Product Modal --- */}
      <Modal visible={showProductModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900">
                إضافة منتج جديد
              </Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <XCircle size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-400 font-bold mb-2 text-xs">
                اسم المنتج
              </Text>
              <TextInput
                placeholder="مثال: ساعة ذكية X1"
                value={productForm.name}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, name: t })
                }
                className="bg-slate-50 p-4 rounded-2xl mb-4 font-bold text-right border border-slate-100"
              />

              <Text className="text-slate-400 font-bold mb-2 text-xs">
                رمز المنتج (SKU)
              </Text>
              <TextInput
                placeholder="SKU-123"
                value={productForm.sku}
                onChangeText={(t) => setProductForm({ ...productForm, sku: t })}
                className="bg-slate-50 p-4 rounded-2xl mb-4 font-bold text-right border border-slate-100"
              />

              <View className="flex-row-reverse gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text text-slate-400 font-bold mb-2 text-xs">
                    السعر الأساسي
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={productForm.basePrice}
                    onChangeText={(t) =>
                      setProductForm({ ...productForm, basePrice: t })
                    }
                    className="bg-slate-50 p-4 rounded-2xl font-bold text-right border border-slate-100"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 font-bold mb-2 text-xs">
                    الكمية المتوفرة
                  </Text>
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={productForm.stockQuantity}
                    onChangeText={(t) =>
                      setProductForm({ ...productForm, stockQuantity: t })
                    }
                    className="bg-slate-50 p-4 rounded-2xl font-bold text-right border border-slate-100"
                  />
                </View>
              </View>

              <Text className="text-slate-400 font-bold mb-2 text-xs">
                الفئة (اختياري)
              </Text>
              <TextInput
                placeholder="إلكترونيات، ملابس..."
                value={productForm.category}
                onChangeText={(t) =>
                  setProductForm({ ...productForm, category: t })
                }
                className="bg-slate-50 p-4 rounded-2xl mb-8 font-bold text-right border border-slate-100"
              />

              <TouchableOpacity
                onPress={handleAddProduct}
                className="bg-emerald-500 py-5 rounded-3xl items-center mb-10 shadow-lg shadow-emerald-500/20"
              >
                <Text className="text-white font-black text-lg">
                  {loadingAddingProduct ? "جاري إضافة..." : "تأكيد الإضافة"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
