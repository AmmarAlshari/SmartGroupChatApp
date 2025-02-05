import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { databases, config } from "../lib/Chats";
import icons from "../constants/icons";
import { Query } from "react-native-appwrite";

const GroupItem = ({ item, currentUser, fetchGroups }) => {
  const navigation = useNavigation();
  const [hasNewMessages, setHasNewMessages] = useState(false);

  useEffect(() => {
    // Parse lastReadMessages from JSON string
    const lastReadMessages = item.lastReadMessages
      ? JSON.parse(item.lastReadMessages)
      : {};

    // Check if the last message was not read by the current user and was not sent by the current user
    if (
      item.lastMessage &&
      item.lastMessage.senderId !== currentUser.$id &&
      (!lastReadMessages[currentUser.$id] ||
        lastReadMessages[currentUser.$id] !== item.lastMessage.$id)
    ) {
      setHasNewMessages(true);
    } else {
      setHasNewMessages(false);
    }
  }, [item.lastMessage, item.lastReadMessages, currentUser.$id]);

  const handleLeaveGroup = async () => {
    try {
      // Replace old messages with a placeholder message
      const messagesResponse = await databases.listDocuments(
        config.databaseId,
        config.messagesCollectionId,
        [
          Query.equal("groupId", item.$id),
          Query.equal("senderId", currentUser.$id),
        ]
      );

      const updateMessagesPromises = messagesResponse.documents.map((message) =>
        databases.updateDocument(
          config.databaseId,
          config.messagesCollectionId,
          message.$id,
          { body: "This message was deleted because the user left the group." }
        )
      );

      await Promise.all(updateMessagesPromises);

      // Remove the user from the group's participants
      const updatedParticipants = item.participants.filter(
        (userId) => userId !== currentUser.$id
      );
      await databases.updateDocument(
        config.databaseId,
        config.groupId,
        item.$id,
        {
          participants: updatedParticipants,
        }
      );
      fetchGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const confirmLeaveGroup = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Leave Group: Are you sure you want to leave the group?"
      );
      if (confirmed) {
        handleLeaveGroup();
      }
    } else {
      Alert.alert("Leave Group", "Are you sure you want to leave the group?", [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: handleLeaveGroup },
      ]);
    }
  };

  const handleJoinGroup = async () => {
    try {
      // Parse lastReadMessages from JSON string
      const lastReadMessages = item.lastReadMessages
        ? JSON.parse(item.lastReadMessages)
        : {};

      // Mark the messages as read by updating the group document
      lastReadMessages[currentUser.$id] = item.lastMessage
        ? item.lastMessage.$id
        : null;
      await databases.updateDocument(
        config.databaseId,
        config.groupId,
        item.$id,
        {
          lastReadMessages: JSON.stringify(lastReadMessages),
        }
      );
      setHasNewMessages(false);
      navigation.navigate("ChatScreen", { groupId: item.$id });
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  return (
    <View className="p-4 mb-4 shadow flex-row items-center border-black-100 border-y-1 rounded-lg">
      <TouchableOpacity className="flex-1" onPress={handleJoinGroup}>
        <Text className="text-xl text-blue-400 font-pregular">
          {item.name} -<Text> {item.section} </Text>
        </Text>
        {item.lastMessage && (
          <Text
            className={`text-sm mt-1 ${
              hasNewMessages ? "text-green-500" : "text-gray-500"
            }`}
          >
            {item.lastMessage.body}
          </Text>
        )}
      </TouchableOpacity>
      {hasNewMessages && (
        <View className="bg-green-500 w-3 h-3 rounded-full ml-2" />
      )}
      <TouchableOpacity onPress={confirmLeaveGroup} className="ml-2 p-2">
        <Image
          source={icons.logout}
          className="w-6 h-6"
          style={Platform.OS === "web" ? { width: 30, height: 30 } : {}}
        />
      </TouchableOpacity>
    </View>
  );
};

export default GroupItem;
