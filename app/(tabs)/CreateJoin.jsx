import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";
import CreateGroup from "../../components/CreateGroup";

const CreateJoin = () => {
  return (
    <View className="bg-primary h-full">
      <CreateGroup />
    </View>
  );
};

export default CreateJoin;
