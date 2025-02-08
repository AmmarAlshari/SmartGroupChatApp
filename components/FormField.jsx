import { View, Text, TextInput, Image, TouchableOpacity, Platform } from "react-native";
import React, { useState } from "react";
import { icons } from "../constants";
// form field component for username and email and password
const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium py-2">{title}</Text>
      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center">
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
        />
        {/* logic for handling eyeHide and eyeshow */}
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eyeHide : icons.eye}
              className="w-6 h-6"
              resizeMode="contain"
              style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
