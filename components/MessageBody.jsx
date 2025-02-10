import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
} from "react-native";
import icons from "../constants/icons";
import { Modal } from "react-native";

const MessageBody = ({
  item,
  currentUser,
  handleEditMessage,
  handleDeleteMessage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
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
    <View>
      <View
        className={`max-w-4/6 p-3 rounded-lg mb-2 shadow ${
          item.senderId === currentUser?.$id
            ? "bg-green-100 self-end"
            : "bg-white self-start"
        }`}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-1xl font-pregular text-gray-950">
            {item.senderName}
          </Text>
          {item.senderId === currentUser?.$id && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="ml-1 mt-2"
            >
              <Image
                source={icons.menu}
                className="w-5 h-5"
                resizeMode="contain"
                style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
              />
            </TouchableOpacity>
          )}
        </View>

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
          <Text className="text-base text-gray-700 font-semibold">
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
      </View>

      {/* Modal for edit/delete options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-end  bg-black opacity-80">
          <View className="bg-white p-6 rounded-lg w-3/4 ">
            <TouchableOpacity
              onPress={() => {
                handleEditMessage(item);
                setModalVisible(false);
              }}
              className="mb-4"
            >
              <Text className="text-blue-500 text-lg">Edit message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleDeleteMessage(item.$id);
                setModalVisible(false);
              }}
              className="mb-4"
            >
              <Text className="text-red-500 text-lg">Delete message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mt-4"
            >
              <Text className="text-gray-950 text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MessageBody;
