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
  Modal,
  TextInput,
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
  Eye,
  Package,
  MapPin,
  Minus,
  Edit,
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
  updateOrderByConfirmer,
} from "../../src/features/orders/orderActions";
import { StatusBar } from "expo-status-bar";
import { ORDER_STATUS_LABELS_AR, OrderStatusKey } from "@/src/utils/utility";

const ConfirmerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { orders, loading, refreshing } = useSelector(
    (state: RootState) => state.orders,
  );
  const { user: confirmer } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  // Updated formData to handle array of items
  const [formData, setFormData] = useState({
    _id: "",
    customerName: "",
    customerPhone: "",
    totalAmount: 0,
    wilaya: "الجزائر",
    address: "",
    items: [] as any[],
  });

  useEffect(() => {
    dispatch(getConfirmerOrders());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(getConfirmerOrders());
  };

  // --- Product Management Logic ---
  
  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.priceAtTimeOfOrder * item.quantity), 0);
  };

const updateQuantity = (index: number, delta: number) => {
  // 1. Create a shallow copy of the items array
  const newItems = [...formData.items];

  // 2. Create a NEW object for the specific item (breaks the "read-only" link)
  const updatedItem = { 
    ...newItems[index], 
    quantity: Math.max(1, newItems[index].quantity + delta) 
  };

  // 3. Put the new object back into our new array
  newItems[index] = updatedItem;

  // 4. Update the state
  setFormData({ 
    ...formData, 
    items: newItems, 
    totalAmount: calculateTotal(newItems) 
  });
  
  console.log("Updated Qty:", newItems[index].quantity);
};

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ 
        ...formData, 
        items: newItems, 
        totalAmount: calculateTotal(newItems) 
    });
  };

  // --- Actions ---

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
          await dispatch(handleNoAnswerOrder({ id: order._id, newAttempts: nextAttempts }));
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
    // Logic to dispatch update action with formData would go here
    await dispatch(updateOrderByConfirmer({formData}));
    setShowForm(false);
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ direction: "rtl" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="bg-slate-900 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-2xl">
        <View className="flex-row-reverse justify-between items-center mb-8">
          <TouchableOpacity
            onPress={() => {
              setEditingOrder(null);
              setFormData({
                _id: "",
                customerName: "",
                customerPhone: "",
                totalAmount: 0,
                wilaya: "الجزائر",
                address: "",
                items: [],
              });
              setShowForm(true);
            }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl"
          >
            <Plus size={22} color="#10b981" strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-row-reverse items-center">
            <View className="mr-3 items-start">
              <Text className="text-white text-lg font-black leading-tight">إدارة التأكيدات</Text>
              <Text className="text-emerald-500 text-[14px] font-bold tracking-wider">مرحباً، {confirmer?.username} 👋</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shadow-sm">
              {confirmer?.profileImageUrl ? (
                <Image source={{ uri: confirmer.profileImageUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-emerald-500 font-black text-lg">{confirmer?.username?.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {["all", "PENDING", "CONFIRMED", "POSTPONED", "CANCELLED"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl ml-2 ${activeTab === tab ? "bg-emerald-500" : "bg-white/10"}`}
            >
              <Text className={`text-[11px] font-black ${activeTab === tab ? "text-white" : "text-white/60"}`}>
                {tab === "all" ? "الكل" : tab === "PENDING" ? "معلقة" : tab === "CONFIRMED" ? "مؤكدة" : tab === "POSTPONED" ? "مؤجلة" : "ملغاة"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10b981"]} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
        ) : (
          <View>
            {(() => {
              const filteredList = orders.filter((o: any) => activeTab === "all" || o.status === activeTab);
              if (filteredList.length === 0) {
                return (
                  <View className="items-center justify-center py-20">
                    <View className="bg-slate-100 p-6 rounded-full mb-4"><Clock size={40} color="#94a3b8" /></View>
                    <Text className="text-slate-500 text-lg font-black">لا يوجد طلبات حالياً</Text>
                  </View>
                );
              }

              return filteredList.map((order: any) => (
                <View key={order._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 mb-4 relative overflow-hidden">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View className={`px-4 py-1.5 rounded-full ${order.status === "CONFIRMED" ? "bg-emerald-500" : order.status === "CANCELLED" ? "bg-rose-500" : order.status === "POSTPONED" ? "bg-blue-500" : "bg-amber-500"}`}>
                        <Text className="text-[10px] font-black uppercase text-white">{ORDER_STATUS_LABELS_AR[order.status as OrderStatusKey]}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setViewingOrder(order)} className="bg-slate-50 p-2 rounded-xl ml-2 border border-slate-100">
                        <Eye size={16} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-slate-400 text-[15px] ml-1">طلبية رقم:</Text>
                      <Text className="font-black text-[15px] text-slate-700">#{order.orderNumber}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-end mb-6">
                    <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100 items-center min-w-[100px]">
                      <Text className="text-[14px] font-black text-red-600">{order.totalAmount} دج</Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المجموع</Text>
                    </View>
                    <View className="items-end flex-1">
                      <Text className="text-[16px] font-black text-slate-800">{order.customerName}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customerPhone}`)} className="flex-row items-center mt-1">
                        <Text className="text-[11px] font-bold text-slate-500 ml-1">{order.customerPhone}</Text>
                        <Phone size={12} color="#10b981" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <TouchableOpacity onPress={() => handleConfirmOrder(order._id)} className="flex-1 min-w-[48%] bg-emerald-600 py-3.5 rounded-2xl flex-row justify-center items-center">
                      <Text className="text-white font-black text-[10px] ml-2">تأكيد</Text>
                      <CheckCircle size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePostpone(order._id)} className="flex-1 min-w-[48%] bg-blue-600 py-3.5 rounded-2xl flex-row justify-center items-center">
                      <Text className="text-white font-black text-[10px] ml-2">تأجيل</Text>
                      <Clock size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNoAnswerAction(order)} className="flex-1 min-w-[48%] bg-amber-500 py-3.5 rounded-2xl flex-row justify-center items-center">
                      <Text className="text-white font-black text-[10px] ml-2">لا يرد ({order.callAttempts}/3)</Text>
                      <PhoneOff size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCancel(order._id)} className="flex-1 min-w-[48%] bg-rose-500 py-3.5 rounded-2xl flex-row justify-center items-center">
                      <Text className="text-white font-black text-[10px] ml-2">إلغاء</Text>
                      <XCircle size={14} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="mt-5 pt-4 border-t border-slate-50 flex-row justify-between items-center">
                    <TouchableOpacity><Trash2 size={18} color="#fca5a5" /></TouchableOpacity>
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
                          items: [...order.items], // Load existing products
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
      <Modal visible={!!viewingOrder} animationType="slide" transparent onRequestClose={() => setViewingOrder(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[3rem] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-slate-900 text-xl font-black  mb-6">تفاصيل الطلبية</Text>
            
            <View className="bg-slate-50 rounded-3xl p-5 mb-5 border border-slate-100">
              <View className="flex-row items-center mb-1">
                <Package size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">قائمة المنتجات:</Text>
              </View>
              {viewingOrder?.items?.map((item: any, index: number) => (
                <View key={index} className={`flex-row justify-between items-center py-3 ${index !== viewingOrder.items.length - 1 ? "border-b border-slate-200/50" : ""}`}>
                  <View className="bg-emerald-100 px-3 py-1 rounded-lg">
                    <Text className="text-emerald-700 font-black text-[14px]">{item.priceAtTimeOfOrder } دج {" "}
                      <Text className="text-red-600">x{item.quantity}</Text>
                      </Text>
                  </View>
                  <Text className="text-slate-700 font-bold text-[16px] flex-1  ml-2">{item.productName}</Text>
                </View>
              ))}
            </View>

            <View className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
              <View className="flex-row items-center mb-3">
                <MapPin size={18} color="#10b981" />
                <Text className="text-slate-800 font-black mr-2">معلومات التوصيل:</Text>
              </View>
              <Text className="text-slate-700 font-bold ">الولاية: {viewingOrder?.wilaya}</Text>
              <Text className="text-slate-500 font-bold mt-1 ">العنوان: {viewingOrder?.address || "غير محدد"}</Text>
            </View>

            <TouchableOpacity onPress={() => setViewingOrder(null)} className="bg-slate-900 py-4 rounded-2xl items-center mb-4">
              <Text className="text-white font-black text-base">إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NEW: Edit Form Modal --- */}
      <Modal visible={showForm} animationType="fade" transparent onRequestClose={() => setShowForm(false)}>
        <View className="flex-1 bg-black/60 justify-center p-4">
          <View className="bg-white rounded-[2.5rem] p-6 shadow-xl max-h-[90%]">
            <Text className="text-slate-900 text-xl font-black  mb-4">تعديل بيانات الطلب</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Customer Inputs */}
              <Text className="text-slate-400 font-bold  mb-1">إسم الزبون</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3  font-bold"
                value={formData.customerName}
                onChangeText={(t) => setFormData({...formData, customerName: t})}
              />
              
              <Text className="text-slate-400 font-bold  mb-1">رقم الهاتف</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3  font-bold"
                keyboardType="phone-pad"
                value={formData.customerPhone}
                onChangeText={(t) => setFormData({...formData, customerPhone: t})}
              />

              {/* Product Section */}
              <View className="border-t border-slate-100 mt-2 pt-4">
                <Text className="text-slate-800 font-black  mb-3">تعديل المنتجات:</Text>
                {formData.items.map((item, idx) => (
                  <View key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3">
                    <Text className="text-slate-700 font-bold  mb-2">{item.productName}</Text>
                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity onPress={() => removeItem(idx)}>
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                      
                      <View className="flex-row items-center bg-white rounded-lg border border-slate-200 px-2">
                        <TouchableOpacity onPress={() => updateQuantity(idx, 1)} className="p-2">
                          <Plus size={16} color="#10b981" />
                        </TouchableOpacity>
                        <Text className="font-black px-4">{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(idx, -1)} className="p-2">
                          <Minus size={16} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <Text className="text-slate-400 font-bold  mb-1">العنوان</Text>
              <TextInput 
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3  font-bold"
                multiline
                value={formData.address}
                onChangeText={(t) => setFormData({...formData, address: t})}
              />

              <View className="bg-red-50 p-4 rounded-xl mt-2 items-center">
                 <Text className="text-red-600 font-black text-lg">{formData.totalAmount} دج</Text>
                 <Text className="text-red-400 text-[10px] font-bold">المجموع الجديد</Text>
              </View>
            </ScrollView>

            <View className="flex-row gap-2 mt-4">
              <TouchableOpacity onPress={() => setShowForm(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl items-center">
                <Text className="text-slate-500 font-black">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveOrder} className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center">
                <Text className="text-white font-black">حفظ التعديلات</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker value={new Date()} mode="date" display="default" minimumDate={new Date()} onChange={onDateChange} />
      )}
    </View>
  );
};

export default ConfirmerDashboard;