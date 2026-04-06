import React from "react";
import { Image, View } from "react-native";

const Logo = () => {
  return (
    <View className="items-center justify-center my-8">
      <View className="w-28 h-28 bg-white rounded-[2.5rem] shadow-xl items-center justify-center border border-slate-100 overflow-hidden">
        <Image
          source={require("../assets/images/logo.jpeg")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

export default Logo;
