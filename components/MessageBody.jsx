import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
} from "react-native";
import icons from "../constants/icons";

const MessageBody = ({
  item,
  currentUser,
  handleEditMessage,
  handleDeleteMessage,
}) => {
  const isFileMessage = item.body.startsWith("File:");

  const handleFileClick = async () => {
    if (!item.fileUrl) {
      console.error("File URL is missing", item.File);
      return;
    }

    try {
      const fileUrl = item.fileUrl;
      console.log("Opening file:", item.fileUrl);

      if (Platform.OS === "web") {
        window.open(fileUrl, "_blank");
      } else {
        Linking.openURL(fileUrl).catch((err) =>
          console.error("Failed to open file:", err)
        );
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };
  const truncateFileName = (fileName, maxLength = 25) => {
    const cleanFileName = fileName.replace(/^File:/, "");
    if (cleanFileName.length <= maxLength) return cleanFileName;
    const extension = cleanFileName.split(".").pop();
    return `${cleanFileName.substring(0, maxLength)}...${extension}`;
  };
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
      {isFileMessage ? (
        <TouchableOpacity
          onPress={handleFileClick}
          className="items-center p-2"
        >
          <Image
            source={icons.file}
            className="w-10 h-10 m-2"
            resizeMode="contain"
            style={Platform.OS === "web" ? { width: 30, height: 30 } : {}}
          />
          <Text className="text-blue-400 font-pregular">
            {truncateFileName(item.body)}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-base text-gray-800 font-semibold">
          {item.body}
        </Text>
      )}

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
