import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Alert, 
  Linking, RefreshControl, Modal, TextInput 
} from 'react-native';
import { 
  CheckCircle, XCircle, Clock, Phone, Package, 
  Plus, PhoneOff, AlertTriangle, Edit3, Trash2, 
  Save, Calendar
} from 'lucide-react-native';

const ConfirmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  
  // البيانات الأساسية
  const [orders, setOrders] = useState([
    { 
      _id: 'ORD-5501', customerName: 'أحمد علي', customerPhone: '0550112233', 
      productName: 'خلاط كهربائي', totalAmount: 5100, 
      wilaya: 'الجزائر', address: 'حي الموز، باب الزوار', status: 'PENDING',
      callAttempts: 0, lastAttemptDate: null, postponedDate: null, createdAt: '2024-05-20'
    }
  ]);

  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', productName: '', 
    totalAmount: '', wilaya: 'الجزائر', address: ''
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // وظيفة "لا يرد" مع الإلغاء التلقائي بعد 6 محاولات
  const handleNoAnswerAction = (id: string) => {
    setOrders(prev => prev.map(order => {
      if (order._id === id) {
        const newAttempts = (order.callAttempts || 0) + 1;
        if (newAttempts >= 6) {
          Alert.alert("نظام ضمان", "تم إلغاء الطلب تلقائياً (6 محاولات بدون رد)");
          return { ...order, callAttempts: newAttempts, status: 'CANCELLED' };
        }
        return { ...order, callAttempts: newAttempts, status: 'NO_ANSWER' };
      }
      return order;
    }));
  };

  // وظيفة التأجيل
  const handlePostpone = (id: string) => {
    Alert.prompt(
      "تأجيل الطلبية",
      "أدخل تاريخ التأجيل (مثال: 2024-06-01)",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "تأكيد", 
          onPress: (date) => {
            if (date) {
              setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'POSTPONED', postponedDate: date } : o));
            }
          }
        }
      ]
    );
  };

  // وظيفة حفظ الطلب (إضافة أو تعديل)
  const handleSaveOrder = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o._id === editingOrder._id ? { ...o, ...formData, totalAmount: Number(formData.totalAmount) } : o));
    } else {
      const newOrder = {
        ...formData,
        _id: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        totalAmount: Number(formData.totalAmount),
        status: 'PENDING',
        callAttempts: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOrders([newOrder, ...orders]);
    }
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <View className="bg-slate-900 pt-14 pb-6 px-6 rounded-b-[3rem] shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            onPress={() => { setEditingOrder(null); setShowForm(true); }}
            className="bg-emerald-500 p-3 rounded-2xl shadow-lg active:scale-95"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
          <View className="items-end">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">نظام ضمان المركزي</Text>
            <Text className="text-white text-xl font-black">إدارة التأكيدات</Text>
          </View>
        </View>

        {/* Tabs Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['all', 'PENDING', 'CONFIRMED', 'POSTPONED', 'NO_ANSWER', 'CANCELLED'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl ml-2 ${activeTab === tab ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <Text className={`text-[11px] font-black ${activeTab === tab ? 'text-white' : 'text-white/60'}`}>
                {tab === 'all' ? 'الكل' : tab === 'PENDING' ? 'جديدة' : tab === 'CONFIRMED' ? 'مؤكدة' : tab === 'POSTPONED' ? 'مؤجلة' : tab === 'NO_ANSWER' ? 'لا يرد' : 'ملغاة'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="p-4" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.filter(o => activeTab === 'all' || o.status === activeTab).map((order: any) => (
          <View key={order._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 mb-4 relative overflow-hidden">
            
            {/* Status Badge */}
            <View className={`absolute top-0 left-0 px-4 py-1 rounded-br-2xl ${
              order.status === 'CONFIRMED' ? 'bg-emerald-500' : 
              order.status === 'CANCELLED' ? 'bg-rose-500' : 
              order.status === 'POSTPONED' ? 'bg-blue-500' : 'bg-amber-500'
            }`}>
              <Text className="text-[8px] font-black text-white">
                {order.status === 'PENDING' ? 'جديدة' : order.status === 'CONFIRMED' ? 'مؤكدة' : order.status === 'POSTPONED' ? 'مؤجلة' : order.status === 'CANCELLED' ? 'ملغاة' : 'لا يرد'}
              </Text>
            </View>

            <View className="flex-row justify-between items-start mb-4 pt-2">
              {/* Price Left */}
              <View className="bg-slate-50 p-3 rounded-2xl border border-slate-100 items-center min-w-[90px]">
                <Text className="text-[12px] font-black text-slate-800">{order.totalAmount} دج</Text>
                <Text className="text-[7px] font-bold text-slate-400 uppercase">المجموع</Text>
              </View>

              {/* Name Right */}
              <View className="items-end flex-1 ml-4">
                <Text className="text-[9px] font-black text-slate-300">#{order._id.slice(-6)} • {order.createdAt}</Text>
                <Text className="text-md font-black text-slate-800 mt-0.5">{order.customerName}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customerPhone}`)} className="flex-row items-center mt-1">
                  <Text className="text-[11px] font-bold text-slate-500 mr-2">{order.customerPhone}</Text>
                  <Phone size={12} color="#10b981" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Details Box */}
            <View className="bg-slate-50 rounded-2xl p-3 mb-4 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-[10px] font-bold text-slate-900">{order.productName}</Text>
                <Text className="text-[10px] font-black text-slate-400">: المنتج</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-[10px] font-bold text-emerald-600">{order.wilaya}</Text>
                <Text className="text-[10px] font-black text-slate-400">: الولاية</Text>
              </View>
              {order.postponedDate && (
                <View className="flex-row justify-between bg-blue-50 p-1 rounded-lg">
                  <Text className="text-[10px] font-bold text-blue-600">{order.postponedDate}</Text>
                  <Text className="text-[10px] font-black text-blue-400">: تاريخ التأجيل</Text>
                </View>
              )}
            </View>

            {/* Action Buttons Grid */}
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity 
                onPress={() => setOrders(orders.map(o => o._id === order._id ? {...o, status: 'CONFIRMED'} : o))}
                className="flex-1 min-w-[48%] bg-emerald-600 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <Text className="text-white font-black text-[10px] mr-2">تأكيد</Text>
                <CheckCircle size={14} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handlePostpone(order._id)}
                className="flex-1 min-w-[48%] bg-blue-600 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <Text className="text-white font-black text-[10px] mr-2">تأجيل</Text>
                <Clock size={14} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleNoAnswerAction(order._id)}
                className="flex-1 min-w-[48%] bg-amber-500 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <Text className="text-white font-black text-[10px] mr-2">لا يرد ({order.callAttempts}/6)</Text>
                <PhoneOff size={14} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("تأكيد", "هل أنت متأكد من إلغاء هذه الطلبية؟", [
                    { text: "تراجع", style: "cancel" },
                    { text: "إلغاء الطلبية", onPress: () => setOrders(orders.map(o => o._id === order._id ? {...o, status: 'CANCELLED'} : o)) }
                  ]);
                }}
                className="flex-1 min-w-[48%] bg-rose-500 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
              >
                <Text className="text-white font-black text-[10px] mr-2">إلغاء الطلب</Text>
                <XCircle size={14} color="white" />
              </TouchableOpacity>
            </View>

            {/* Footer Edit/Delete */}
            <View className="mt-4 pt-3 border-t border-slate-50 flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setOrders(orders.filter(o => o._id !== order._id))}>
                <Trash2 size={14} color="#fca5a5" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setEditingOrder(order);
                  setFormData({
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    productName: order.productName,
                    totalAmount: order.totalAmount.toString(),
                    wilaya: order.wilaya,
                    address: order.address
                  });
                  setShowForm(true);
                }}
                className="flex-row items-center"
              >
                <Text className="text-[10px] font-bold text-slate-400 mr-1">تعديل البيانات</Text>
                <Edit3 size={12} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Form Modal (Add/Edit) */}
      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[3rem] p-8 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={() => setShowForm(false)}><XCircle size={24} color="#cbd5e1" /></TouchableOpacity>
              <Text className="text-xl font-black text-slate-800">{editingOrder ? 'تعديل طلبية' : 'إضافة طلبية'}</Text>
            </View>
            <ScrollView className="space-y-4">
               {/* Inputs... */}
               <TextInput 
                  className="w-full p-4 bg-slate-50 rounded-2xl text-right font-bold border border-slate-100 mb-3"
                  placeholder="اسم الزبون"
                  value={formData.customerName}
                  onChangeText={(t) => setFormData({...formData, customerName: t})}
               />
               <TextInput 
                  className="w-full p-4 bg-slate-50 rounded-2xl text-right font-bold border border-slate-100 mb-3"
                  placeholder="رقم الهاتف"
                  value={formData.customerPhone}
                  onChangeText={(t) => setFormData({...formData, customerPhone: t})}
               />
               <TextInput 
                  className="w-full p-4 bg-slate-50 rounded-2xl text-right font-bold border border-slate-100 mb-3"
                  placeholder="المنتج"
                  value={formData.productName}
                  onChangeText={(t) => setFormData({...formData, productName: t})}
               />
               <TextInput 
                  className="w-full p-4 bg-slate-50 rounded-2xl text-right font-bold border border-slate-100 mb-3"
                  placeholder="المبلغ"
                  keyboardType="numeric"
                  value={formData.totalAmount}
                  onChangeText={(t) => setFormData({...formData, totalAmount: t})}
               />
               <TouchableOpacity onPress={handleSaveOrder} className="bg-slate-900 py-4 rounded-2xl flex-row justify-center items-center">
                  <Text className="text-white font-black mr-2">حفظ وتحديث</Text>
                  <Save size={20} color="white" />
               </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmerDashboard;