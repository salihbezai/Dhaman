import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { 
  ShieldCheck, 
  Info, 
  Mail, 
  Globe, 
  Github, 
  Layers, 
  CheckCircle2 
} from "lucide-react-native";
import packageJson from "../../package.json"
const AboutPage = () => {
  const appVersion = "1.0.0"; // Pull this from package.json if possible

  const FeatureItem = ({ icon: Icon, title, desc }: any) => (
    <View className="flex-row-reverse items-start mb-6">
      <View className="bg-emerald-500/10 p-3 rounded-2xl ml-4">
        <Icon size={24} color="#10b981" />
      </View>
      <View className="flex-1 items-end">
        <Text className="text-slate-800 font-black text-base">{title}</Text>
        <Text className="text-slate-500 font-bold text-xs text-right mt-1">
          {desc}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* 1. Brand Header */}
      <View className="bg-slate-900 pt-16 pb-12 px-6 rounded-b-[3.5rem] items-center shadow-2xl">
        <View className="w-24 h-24 bg-emerald-500 rounded-[30px] items-center justify-center shadow-xl shadow-emerald-500/40 mb-4">
          <ShieldCheck size={50} color="white" strokeWidth={2.5} />
        </View>
        <Text className="text-white text-3xl font-black tracking-tighter">Dhaman Pro</Text>
        <Text className="text-emerald-400 font-bold text-sm mt-1 uppercase tracking-widest">
           Confirmation System
        </Text>
      </View>

      {/* 2. Content Section */}
      <View className="p-6 -mt-8">
        <View className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <Text className="text-slate-800 text-xl font-black mb-6 text-right">حول المنصة</Text>
          
          <FeatureItem 
            icon={CheckCircle2}
            title="دقة التأكيد"
            desc="نظام متطور لإدارة طلبيات التجارة الإلكترونية وضمان جودة البيانات قبل الشحن."
          />
          
          <FeatureItem 
            icon={Layers}
            title="إدارة ذكية"
            desc="تتبع محاولات الاتصال، تأجيل الطلبات، وتنظيم المواعيد بشكل آلي وسهل."
          />
        </View>

        {/* 3. Support & Links */}
        <View className="mt-6 bg-slate-900 rounded-[2.5rem] p-6 shadow-xl">
          <Text className="text-white text-lg font-black mb-4 text-right">الدعم الفني</Text>
          
          <TouchableOpacity 
            onPress={() => Linking.openURL('mailto:support@dhaman.dz')}
            className="flex-row-reverse items-center bg-white/5 p-4 rounded-2xl mb-3"
          >
            <Mail size={20} color="#94a3b8" />
            <Text className="text-slate-300 font-bold mr-3 flex-1 text-right">support@dhaman.dz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Linking.openURL('https://dhaman.dz')}
            className="flex-row-reverse items-center bg-white/5 p-4 rounded-2xl"
          >
            <Globe size={20} color="#94a3b8" />
            <Text className="text-slate-300 font-bold mr-3 flex-1 text-right">الموقع الرسمي</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Footer Info */}
        <View className="items-center py-10">
          <Text className="text-slate-400 font-bold text-xs">إصدار التطبيق {packageJson.version}</Text>
          <Text className="text-slate-300 font-bold text-[10px] mt-1 uppercase">
            © 2026 Dhaman Logistics Solutions
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AboutPage;