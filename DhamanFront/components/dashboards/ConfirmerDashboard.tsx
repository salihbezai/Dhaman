import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Plus,
  PhoneOff,
  Edit3,
  Trash2,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import {
  getConfirmerOrders,
  handleCancelOrder,
  handleConfirmTheOrder,
  handleNoAnswerOrder,
  handlePostponeOrder,
  // addNewOrder,
  // editExistingOrder,
  // deleteOrder
} from "../../src/features/orders/orderActions"; // Path to your actions
import { StatusBar } from "expo-status-bar";
import { ORDER_STATUS_LABELS_AR, OrderStatusKey } from "@/src/utils/utility";

const ConfirmerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Data from Redux
  const { orders, loading, refreshing } = useSelector(
    (state: RootState) => state.orders,
  );
  const { user: confirmer } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    productName: "",
    totalAmount: "",
    wilaya: "الجزائر",
    address: "",
  });

  // Initial Fetch
  useEffect(() => {
    dispatch(getConfirmerOrders());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(getConfirmerOrders());
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
    // 1. Check current state first
    if (order.callAttempts >= 3) {
      Alert.alert("تنبيه", "هذا الطلب ملغى بالفعل لتجاوز المحاولات");
      return;
    }

    // 2. Calculate the NEW value BEFORE using it in the Alert
    const currentAttempts = order.callAttempts || 0;
    const nextAttempts = currentAttempts + 1;

    Alert.alert("تنبيه", "هل تريد تسجيل حالة عدم رد؟", [
      { text: "تراجع", style: "cancel" },
      {
        text: "حفظ",
        onPress: async () => {
          // Now nextAttempts is correctly captured in this closure
          await dispatch(
            handleNoAnswerOrder({ id: order._id, newAttempts: nextAttempts }),
          );

          // Only show this alert if the result of THIS click is the 3rd one
          if (nextAttempts >= 3) {
            Alert.alert("معلومة", "تم تحويل الطلب إلى ملغى (3 محاولات)");
          }
        },
      },
    ]);
  };

  // const handlePostpone = async (id: string) => {
  //   console.log("we are clicking ");
  //   Alert.alert("تأجيل الطلبية", "أدخل تاريخ التأجيل", [
  //     { text: "إلغاء", style: "cancel" },
  //     {
  //       text: "تأكيد",
  //       onPress: async (date: any) =>
  //         date &&
  //         (await dispatch(handlePostponeOrder({ id, postponedDate: date }))),
  //     },
  //   ]);
  // };

  const handlePostpone = (id: string) => {
    setSelectedOrderId(id);
    setShowDatePicker(true); // Open the calendar
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Close calendar
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
    // if (editingOrder) {
    //   await dispatch(editExistingOrder({ id: editingOrder._id, ...formData }));
    // } else {
    //   await dispatch(addNewOrder(formData));
    // }
    // setShowForm(false);
    // setEditingOrder(null);
  };

  console.log("refresh and loading " + refreshing + " and " + loading);
  return (
    <View className="flex-1 bg-slate-50" style={{ direction: "rtl" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-slate-900 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-2xl">
        <View className="flex-row-reverse justify-between items-center mb-8">
         
          {/* القسم الأيسر: زر الإضافة */}
          <TouchableOpacity
            onPress={() => {
              setEditingOrder(null);
              setFormData({
                customerName: "",
                customerPhone: "",
                productName: "",
                totalAmount: "",
                wilaya: "الجزائر",
                address: "",
              });
              setShowForm(true);
            }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl"
          >
            <Plus size={22} color="#10b981" strokeWidth={2.5} />
          </TouchableOpacity>
         
          {/* القسم الأيمن: الصورة والنصوص */}
          <View className="flex-row-reverse items-center">
            {/* Avatar */}
            

            {/* النصوص */}
            <View className="mr-3 items-start">
              <Text className="text-white text-lg font-black leading-tight">
                إدارة التأكيدات
              </Text>
              <Text className="text-emerald-500 text-[10px] font-bold tracking-wider">
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

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {["all", "PENDING", "CONFIRMED", "POSTPONED", "CANCELLED"].map(
            (tab) => (
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
                        : tab === "POSTPONED"
                          ? "مؤجلة"
                          : "ملغاة"}
                </Text>
              </TouchableOpacity>
            ),
          )}
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
            {/* 1. We create the filtered list first */}
            {(() => {
              const filteredList = orders.filter(
                (o: any) => activeTab === "all" || o.status === activeTab,
              );

              {
                /* 2. Check if the filtered list is empty */
              }
              if (filteredList.length === 0) {
                return (
                  <View className="items-center justify-center py-20">
                    {/* Icon for empty state */}
                    <View className="bg-slate-100 p-6 rounded-full mb-4">
                      <Clock size={40} color="#94a3b8" />
                    </View>
                    <Text className="text-slate-500 text-lg font-black">
                      لا يوجد طلبات حالياً
                    </Text>
                    <Text className="text-slate-400 text-sm font-bold mt-1">
                      جرب اختيار قسم آخر أو السحب للتحديث
                    </Text>
                  </View>
                );
              }

              {
                /* 3. If NOT empty, map the orders */
              }
              return filteredList.map((order: any) => (
                <View
                  key={order._id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 mb-4 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View
                      className={`px-4 py-1.5 rounded-full ${
                        order.status === "CONFIRMED"
                          ? "bg-emerald-500"
                          : order.status === "CANCELLED"
                            ? "bg-rose-500"
                            : order.status === "POSTPONED"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                      }`}
                    >
                      <Text className="text-[10px] font-black uppercase text-white">
                        {ORDER_STATUS_LABELS_AR[order.status as OrderStatusKey]}
                      </Text>
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

                  {/* Price and Customer */}
                  <View className="flex-row justify-between items-end mb-6">
                    <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100 items-center min-w-[100px]">
                      <Text className="text-[14px] font-black text-slate-800">
                        {order.totalAmount} دج
                      </Text>
                      <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
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

                  {/* Buttons Grid */}
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

                  {/* Edit/Delete Footer */}
                  <View className="mt-5 pt-4 border-t border-slate-50 flex-row justify-between items-center">
                    <TouchableOpacity>
                      <Trash2 size={16} color="#fca5a5" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingOrder(order);
                        setShowForm(true);
                      }}
                      className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-[10px] font-bold text-slate-400 mr-1.5">
                        تعديل الطلب
                      </Text>
                      <Edit3 size={12} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>
              ));
            })()}
          </View>
        )}
      </ScrollView>

      {/* Modal form stays roughly the same but triggers dispatch(handleSaveOrder) */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()} // Can't postpone to the past!
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default ConfirmerDashboard;
