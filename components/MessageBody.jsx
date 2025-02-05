import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const MessageBody = ({
  item,
  currentUser,
  handleEditMessage,
  handleDeleteMessage,
}) => {
  return (
    <View
      className={`max-w-4/6 p-3 rounded-lg mb-2 shadow ${
        item.senderId === currentUser?.$id
          ? "bg-green-100 self-end"
          : "bg-white self-start"
      }`}
    >
      <Text className="text-1xl font-pregular text-gray-800">
        {item.senderName}
      </Text>
      <Text className="text-base text-gray-800 font-semibold">{item.body}</Text>
      {item.edited && <Text className="text-xs text-gray-500">edited</Text>}
      <Text className="text-xs text-gray-500">
        {new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      {item.senderId === currentUser?.$id && (
        <View className="flex-row justify-end mt-1 space-x-4">
          <TouchableOpacity onPress={() => handleEditMessage(item)}>
            <Text className="text-xs text-blue-500 mx-2">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteMessage(item.$id)}>
            <Text className="text-xs text-red-500 mx-2">Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MessageBody;
