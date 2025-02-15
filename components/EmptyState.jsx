import { View, Text, Image, Platform } from "react-native";
import React from "react";
import { images } from "../constants";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

const EmptyState = ({ title, description }) => {
  return (
    <View className="justify-center items-center p-4 my-10">
      <Image
        source={images.empty}
        className="w-[270px] h-[215]"
        style={Platform.OS === "web" ? { width: 300, height: 250 } : {}}
        resizeMode="contain"
      />
      <Text className="font-psemibold text-xl text-gray-100 mt-5">{title}</Text>
      <Text className="font-pmedium text-sm text-gray-100 text-center mt-2">
        {description}
      </Text>
      <CustomButton
        title="Find Your Group"
        handlePress={() => router.push("/CreateJoin")}
        containerStyles="w-full my-6"
      />
    </View>
  );
};

export default EmptyState;
