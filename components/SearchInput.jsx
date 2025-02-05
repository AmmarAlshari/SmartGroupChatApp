import { View, TextInput, Image, TouchableOpacity, Platform } from "react-native";
import React, { useState } from "react";
import { icons } from "../constants";

const SearchInput = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleChangeText = (text) => {
    setValue(text);
  };

  const handleSearch = () => {
    onSearch(value);
  };

  return (
    <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex-row items-center space-x-4">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={value}
        placeholder="Search for Chats"
        placeholderTextColor="#7b7b8b"
        onChangeText={handleChangeText}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Image source={icons.search} className="w-5 h-5" style={Platform.OS === "web" ? { width: 24, height: 24 } : {}} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
