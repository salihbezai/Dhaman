import {
  getNotifications,
  handleMarkAsRead,
} from "@/src/features/notifications/notificationActions";
import { getProducts } from "@/src/features/products/productActions";
import { AppDispatch, RootState } from "@/src/store/store";
import { ORDER_STATUS_LABELS_AR, OrderStatusKey } from "@/src/utils/utility";
import { WILAYAS } from "@/src/utils/wilayas";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MapPin,
  Minus,
  Package,
  Phone,
  PhoneOff,
  Plus,
  Trash2,
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
import { io } from "socket.io-client";
import {
  getOrders,
  handleAddOrder,
  handleCancelOrder,
  handleConfirmTheOrder,
  handleNoAnswerOrder,
  handlePostponeOrder,
  handleRemoveOrderByConfirmer,
  updateOrderByConfirmer,
} from "../../src/features/orders/orderActions";

const ConfirmerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { orders, loading, refreshing } = useSelector(
    (state: RootState) => state.orders,
  );
  const { products } = useSelector((state: RootState) => state.products);
  const { user: confirmer } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications,
  );

  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showWilayaPicker, setShowWilayaPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [incomingNotification, setIncomingNotification] = useState<any>(null);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const filteredWilayas = WILAYAS.filter(
    (w) =>
      w.ar_name.includes(wilayaSearch) ||
      w.code.toString().includes(wilayaSearch),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [formData, setFormData] = useState({
    _id: "",
    customerName: "",
    customerPhone: "",
    totalAmount: 0,
    wilaya: "باتنة",
    address: "حي الرياض",
    deliveryPrice: 0,
    items: [] as any[],
  });

  useEffect(() => {
    const getData = async () => {
      await dispatch(getOrders());
      await dispatch(getProducts());
      await dispatch(getNotifications());
    };

    getData();
  }, [dispatch]);

  // Sound Player function
  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/notification.mp3"),
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Error playing sound", error);
    }
  };

  // Socket Logic
  useEffect(() => {
    if (!confirmer?.id) return;

    const socket = io(process.env.EXPO_PUBLIC_API_BASE_URL);

    socket.on("connect", () => {
      socket.emit("confirmer_join", confirmer.id);
    });

    socket.on("NEW_NOTIFICATION_DRIVER", async (data) => {
      await playNotificationSound();
      setIncomingNotification(data);
      await dispatch(getNotifications());
    });

    return () => {
      socket.disconnect();
    };
  }, [confirmer?.id, dispatch]);

  useEffect(() => {
    const getData = async () => {
      await dispatch(getNotifications());
    };

    getData();
  }, [dispatch]);

  const onRefresh = async () => {
    await dispatch(getOrders());
    await dispatch(getProducts());
  };

  // --- LOGIC: Calculation including full delivery for client ---
  const calculateTotal = (items: any[], currentWilayaArName: string) => {
    const productsTotal = items.reduce(
      (sum, item) => sum + item.priceAtTimeOfOrder * item.quantity,
      0,
    );

    const selectedWilaya = WILAYAS.find(
      (w) => w.ar_name === currentWilayaArName,
    );
    const deliveryPrice = selectedWilaya
      ? parseInt(selectedWilaya.deliveryPrice)
      : 0;

    // The client pays the full delivery price.
    // You handle the 10% (us) / 90% (driver) split on the backend or in reports.
    return productsTotal + deliveryPrice;
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      Alert.alert("خطأ", "يرجى إدخال إسم الزبون");
      return false;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("خطأ", "العنوان مطلوب لتوصيل الطلبية");
      return false;
    }
    if (!formData.wilaya.trim()) {
      Alert.alert("خطأ", "الولاية مطلوبة لتوصيل الطلبية");
      return false;
    }
    if (formData.items.length === 0) {
      Alert.alert("خطأ", "لا يمكن حفظ طلبية فارغة من المنتجات");
      return false;
    }
    return true;
  };

  const addProductToOrder = (product: any) => {
    const existingItem = formData.items.find(
      (item) => item.productId === product._id,
    );

    if (existingItem) {
      Alert.alert("تنبيه", "المنتج موجود بالفعل في القائمة");
      return;
    }

    const newItem = {
      productId: product._id,
      productName: product.name,
      priceAtTimeOfOrder: product.basePrice,
      quantity: 1,
    };

    const updatedItems = [...formData.items, newItem];
    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: calculateTotal(updatedItems, formData.wilaya),
    });
    setShowProductPicker(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...formData.items];
    const updatedItem = {
      ...newItems[index],
      quantity: Math.max(1, newItems[index].quantity + delta),
    };

    newItems[index] = updatedItem;

    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems, formData.wilaya),
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems, formData.wilaya),
    });
  };

  const handleConfirmOrder = (id: string) => {
    Alert.alert("تأكيد", "تأكيد الطلب؟", [
      { text: "تراجع" },
      {
        text: "تأكيد",
        onPress: async () => await dispatch(handleConfirmTheOrder({ id })),
      },
    ]);
  };

  const handleCancel = (id: string) => {
    Alert.alert("إلغاء", "تأكيد إلغاء الطلب؟", [
      { text: "تراجع" },
      {
        text: "إلغاء",
        onPress: async () => await dispatch(handleCancelOrder({ id })),
      },
    ]);
  };

  const handleNoAnswerAction = async (order: any) => {
    if (order.callAttempts >= 3) {
      Alert.alert("تنبيه", "هذا الطلب ملغى بالفعل لتجاوز المحاولات");
      return;
    }
    const currentAttempts = order.callAttempts || 0;
    const nextAttempts = currentAttempts + 1;
    Alert.alert("تنبيه", "هل تريد تسجيل حالة عدم رد؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "حفظ",
        onPress: async () => {
          await dispatch(
            handleNoAnswerOrder({ id: order._id, newAttempts: nextAttempts }),
          );
          if (nextAttempts >= 3) {
            Alert.alert("معلومة", "تم تحويل الطلب إلى ملغى (3 محاولات)");
          }
        },
      },
    ]);
  };

  const handlePostpone = (id: string) => {
    setSelectedOrderId(id);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && selectedOrderId) {
      dispatch(
        handlePostponeOrder({
          id: selectedOrderId,
          postponedDate: selectedDate.toISOString(),
        }),
      );
      setSelectedOrderId(null);
    }
  };

  const handleSaveOrder = async () => {
    if (!validateForm()) return;
    const { _id, ...newOrderData } = formData;

    const isEditing = formData._id && formData._id !== "";
    const payload = isEditing ? formData : newOrderData;

    if (isEditing) {
      const result = await dispatch(updateOrderByConfirmer({ formData }));
      if (result.meta.requestStatus === "fulfilled") {
        setShowForm(false);
        Alert.alert("تحديث", "تم تعديل بيانات الطلبية بنجاح");
      }
    } else {
      const result = await dispatch(handleAddOrder({ formData: payload }));
      if (result.meta.requestStatus === "fulfilled") {
        setShowForm(false);
        Alert.alert("نجاح", "تم إضافة الطلبية الجديدة بنجاح");
      }
    }
  };

  const handleRemoveOrder = async (order: any) => {
    Alert.alert("تنبيه", "هل تريد حقا حذف هذه الطلبية؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "حفظ",
        onPress: async () => {
          await dispatch(handleRemoveOrderByConfirmer({ id: order._id }));
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ direction: "rtl" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-slate-900 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-2xl">
        <View className="flex-row-reverse justify-between items-center mb-8">
          <View className="flex-row-reverse items-center gap-3">
            <TouchableOpacity
              onPress={() => {
                const defaultWilaya = WILAYAS.find(
                  (w) => w.ar_name === "باتنة",
                );
                setEditingOrder(null);
                setFormData({
                  _id: "",
                  customerName: "",
                  customerPhone: "",
                  totalAmount: 0,
                  wilaya: "باتنة",
                  address: "حي الرياض",
                  deliveryPrice: parseInt(defaultWilaya?.deliveryPrice || "0"),
                  items: [],
                });
                setShowForm(true);
              }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl"
            >
              <Plus size={22} color="#10b981" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowNotifications(true)}
              className="bg-slate-800 border border-slate-700 p-3 rounded-2xl relative"
            >
              <Bell strokeWidth={2.5} className="" size={22} color="white" />
              {notifications.some((n) => n.isRead === false) && (
                <View className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row-reverse items-center">
            <View className="mr-3 items-start">
              <Text className="text-white text-lg font-black leading-tight">
                إدارة التأكيدات
              </Text>
              <Text className="text-emerald-500 text-[14px] font-bold tracking-wider">
                مرحباً، {confirmer?.username} 👋
              </Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shadow-sm">
              {confirmer?.profileImageUrl ? (
                <Image
                  source={{ uri: confirmer.profileImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-emerald-500 font-black text-lg">
                    {confirmer?.username?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {[
            "all",
            "PENDING",
            "CONFIRMED",
            "DELIVERED",
            "POSTPONED",
            "CANCELLED",
          ].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl ml-2 ${activeTab === tab ? "bg-emerald-500" : "bg-white/10"}`}
            >
              <Text
                className={`text-[11px] font-black ${activeTab === tab ? "text-white" : "text-white/60"}`}
              >
                {tab === "all"
                  ? "الكل"
                  : tab === "PENDING"
                    ? "معلقة"
                    : tab === "CONFIRMED"
                      ? "مؤكدة"
                      : tab === "DELIVERED"
                        ? "تم التسليم"
                        : tab === "POSTPONED"
                          ? "مؤجلة"
                          : "ملغاة"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
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
        ) : (
          <View>
            {(() => {
              const filteredList = orders.filter(
                (o: any) => activeTab === "all" || o.status === activeTab,
              );
              if (filteredList.length === 0) {
                return (
                  <View className="items-center justify-center py-20">
                    <View className="bg-slate-100 p-6 rounded-full mb-4">
                      <Clock size={40} color="#94a3b8" />
                    </View>
                    <Text className="text-slate-500 text-lg font-black">
                      لا يوجد طلبات حالياً
                    </Text>
                  </View>
                );
              }

              return filteredList.map((order: any) => (
                <View
                  key={order._id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 mb-4 relative overflow-hidden"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View
                        className={`px-4 py-1.5 rounded-full ${order.status === "CONFIRMED" ? "bg-emerald-500" : order.status === "CANCELLED" ? "bg-rose-500" : order.status === "POSTPONED" ? "bg-blue-500" : "bg-amber-500"}`}
                      >
                        <Text className="text-[10px] font-black uppercase text-white">
                          {
                            ORDER_STATUS_LABELS_AR[
                              order.status as OrderStatusKey
                            ]
                          }
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setViewingOrder(order)}
                        className="bg-slate-50 p-2 rounded-xl ml-2 border border-slate-100"
                      >
                        <Eye size={16} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-slate-400 text-[15px] ml-1">
                        طلبية رقم:
                      </Text>
                      <Text className="font-black text-[15px] text-slate-700">
                        #{order.orderNumber}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-end mb-6">
                    <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100 items-center min-w-[100px]">
                      <Text className="text-[14px] font-black text-red-600">
                        {order.totalAmount} دج
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        المجموع
                      </Text>
                    </View>
                    <View className="items-end flex-1">
                      <Text className="text-[16px] font-black text-slate-800">
                        {order.customerName}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(`tel:${order.customerPhone}`)
                        }
                        className="flex-row items-center mt-1"
                      >
                        <Text className="text-[11px] font-bold text-slate-500 ml-1">
                          {order.customerPhone}
                        </Text>
                        <Phone size={12} color="#10b981" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <TouchableOpacity
                      onPress={() => handleConfirmOrder(order._id)}
                      className="flex-1 min-w-[48%] bg-emerald-600 py-3.5 rounded-2xl flex-row justify-center items-center"
                    >
                      <Text className="text-white font-black text-[10px] ml-2">
                        تأكيد
                      </Text>
                      <CheckCircle size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handlePostpone(order._id)}
                      className="flex-1 min-w-[48%] bg-blue-600 py-3.5 rounded-2xl flex-row justify-center items-center"
                    >
                      <Text className="text-white font-black text-[10px] ml-2">
                        تأجيل
                      </Text>
                      <Clock size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleNoAnswerAction(order)}
                      className="flex-1 min-w-[48%] bg-amber-500 py-3.5 rounded-2xl flex-row justify-center items-center"
                    >
                      <Text className="text-white font-black text-[10px] ml-2">
                        لا يرد ({order.callAttempts}/3)
                      </Text>
                      <PhoneOff size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCancel(order._id)}
                      className="flex-1 min-w-[48%] bg-rose-500 py-3.5 rounded-2xl flex-row justify-center items-center"
                    >
                      <Text className="text-white font-black text-[10px] ml-2">
                        إلغاء
                      </Text>
                      <XCircle size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View className="mt-5 pt-4 border-t border-slate-50 flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => handleRemoveOrder(order)}>
                      <Trash2 size={18} color="#fca5a5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingOrder(order);
                        setFormData({
                          _id: order._id,
                          customerName: order.customerName,
                          customerPhone: order.customerPhone,
                          totalAmount: order.totalAmount,
                          wilaya: order.wilaya,
                          address: order.address,
                          deliveryPrice: order.deliveryPrice,
                          items: [...order.items],
                        });
                        setShowForm(true);
                      }}
                      className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-lg"
                    >
                      <Edit size={18} color="blue" />
                    </TouchableOpacity>
                  </View>
                </View>
              ));
            })()}
          </View>
        )}
      </ScrollView>

      {/* --- Details Modal --- */}
      {/* --- Detailed Order Modal (Arabic Optimized) --- */}
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

      {/* --- Edit Form Modal --- */}
      <Modal
        visible={showForm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowForm(false)}
      >
        <View className="flex-1 bg-black/60 justify-center p-4">
          <View className="bg-white rounded-[2.5rem] p-6 shadow-xl max-h-[90%]">
            <Text className="text-slate-900 text-xl font-black mb-4">
              {formData._id ? "تعديل طلبية" : "إضافة طلبية"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-400 font-bold mb-1">إسم الزبون</Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 font-bold"
                value={formData.customerName}
                onChangeText={(t) =>
                  setFormData({ ...formData, customerName: t })
                }
              />

              <Text className="text-slate-400 font-bold mb-1">رقم الهاتف</Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 font-bold"
                keyboardType="phone-pad"
                value={formData.customerPhone}
                onChangeText={(t) =>
                  setFormData({ ...formData, customerPhone: t })
                }
              />

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

              <Text className="text-slate-400 font-bold mb-1">العنوان</Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 font-bold"
                multiline
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
              />
              <Text className="text-slate-400 font-bold mb-1">
                حقوق التوصيل
              </Text>
              <TextInput
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 font-bold"
                editable={false}
                value={formData.deliveryPrice.toString()}
              />

              <View className="border-t border-slate-100 mt-2 pt-4">
                <Text className="text-slate-800 font-black mb-3">
                  المنتجات:
                </Text>
                {formData.items.map((item, idx) => (
                  <View
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3"
                  >
                    <Text className="text-slate-700 font-bold mb-2">
                      {item.productName}
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity onPress={() => removeItem(idx)}>
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>

                      <View className="flex-row items-center bg-white rounded-lg border border-slate-200 px-2">
                        <TouchableOpacity
                          onPress={() => updateQuantity(idx, 1)}
                          className="p-2"
                        >
                          <Plus size={16} color="#10b981" />
                        </TouchableOpacity>
                        <Text className="font-black px-4">{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => updateQuantity(idx, -1)}
                          className="p-2"
                        >
                          <Minus size={16} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View className="bg-red-50 p-4 rounded-xl mt-2 items-center">
                <Text className="text-red-600 font-black text-lg">
                  {formData.totalAmount} دج
                </Text>
                <Text className="text-red-400 text-[10px] font-bold">
                  المجموع (بما في ذلك التوصيل)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowProductPicker(true)}
                className="flex-row items-center justify-center bg-emerald-50 border border-emerald-200 border-dashed py-3 rounded-xl mt-4 mb-4"
              >
                <Plus size={18} color="#10b981" />
                <Text className="text-emerald-700 font-black mr-2">
                  إضافة منتج للطلب
                </Text>
              </TouchableOpacity>

              <Modal
                visible={showProductPicker}
                animationType="slide"
                transparent
              >
                <View className="flex-1 bg-black/50 justify-center p-6">
                  <View className="bg-white rounded-3xl p-4 max-h-[70%]">
                    <Text className="text-right font-black mb-4">
                      اختر المنتج
                    </Text>
                    <ScrollView>
                      {products.map((prod) => (
                        <TouchableOpacity
                          key={prod._id}
                          onPress={() => addProductToOrder(prod)}
                          className="flex-row-reverse justify-between p-4 border-b border-slate-100"
                        >
                          <Text className="font-bold">{prod.name}</Text>
                          <Text className="text-emerald-600 font-black">
                            {prod.basePrice} دج
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      onPress={() => setShowProductPicker(false)}
                      className="mt-4 bg-slate-100 py-3 rounded-xl items-center"
                    >
                      <Text>إغلاق</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </ScrollView>

            <View className="flex-row gap-2 mt-4">
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
              >
                <Text className="text-slate-500 font-black">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveOrder}
                className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-black">
                  {loading ? "جاري الحفظ..." : "حفظ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification List Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[3rem] h-[75%] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-xl font-black">
                التنبيهات
              </Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View className="items-center py-20">
                  <Bell size={40} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">
                    لا توجد تنبيهات حالياً
                  </Text>
                </View>
              ) : (
                [...notifications].reverse().map((notif: any) => (
                  <TouchableOpacity
                    key={notif._id}
                    className={`p-5 rounded-3xl mb-3 border ${notif.isRead === false ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}
                    onPress={async () => {
                      if (notif.isRead === false) {
                        await dispatch(handleMarkAsRead({ id: notif._id }));
                      }
                      const linkedOrder = orders.find(
                        (o) => o._id === notif.orderId,
                      );
                      if (linkedOrder) {
                        setViewingOrder(linkedOrder);
                        setShowNotifications(false);
                      }
                    }}
                  >
                    <View className="flex-row-reverse justify-between items-center mb-2">
                      <View className="flex-row-reverse items-center">
                        <Text className="text-[10px] text-slate-400 font-bold">
                          {new Date(notif.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}{" "}
                          -{" "}
                          {new Date(notif.createdAt).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                            },
                          )}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MapPin size={16} color="#10b981" />
                        <Text className="text-slate-900 font-black mr-2">
                          تنبيه من سائق
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-600 text-[12px] text-right">
                      لقد وصل السائق إلى موقع الزبون للطلبية رقم #
                      {notif.orderId?.slice(-6)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              className="bg-slate-900 py-4 rounded-2xl items-center mt-4"
            >
              <Text className="text-white font-black">إغلاق</Text>
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
                      const newTotal = calculateTotal(
                        formData.items,
                        wilaya.ar_name,
                      );
                      setFormData({
                        ...formData,
                        wilaya: wilaya.ar_name,
                        // Update: Client pays the original price
                        deliveryPrice: parseInt(wilaya.deliveryPrice || "0"),
                        totalAmount: newTotal,
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

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default ConfirmerDashboard;
