import { ShieldCheck } from "lucide-react-native";
import React from "react";
import { Image, View } from "react-native";

const Logo = () => {
  return (
    <View className="w-24 h-24 bg-emerald-500 rounded-[30px] items-center justify-center shadow-xl shadow-emerald-500/40 mb-4">
      <ShieldCheck size={50} color="white" strokeWidth={2.5} />
    </View>
  );
};

export default Logo;
