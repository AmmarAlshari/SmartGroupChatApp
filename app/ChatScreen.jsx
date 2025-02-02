import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, config } from "../lib/Chats";
import { ID, Query } from "react-native-appwrite";
import { getCurrentUser } from "../lib/appwrite";
import MessageBody from "../components/MessageBody";

const ChatScreen = () => {
  const route = useRoute();
  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [sectionNumber, setSectionNumber] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);

  // Fetch messages, current user, and group name when the component mounts
  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();
    fetchGroupDetails();
  }, []);

  // Fetch messages for the group
  const fetchMessages = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.messagesCollectionId,
        [Query.equal("groupId", groupId), Query.orderDesc("timestamp")]
      );
      setMessages(response.documents);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch the current user
  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch the group details
  const fetchGroupDetails = async () => {
    try {
      const response = await databases.getDocument(
        config.databaseId,
        config.groupId,
        groupId
      );
      setGroupName(response.name);
      setSectionNumber(response.section);
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  // Handle sending a new message or editing an existing message
  const handleSendMessage = async () => {
    if (!currentUser) return;

    if (editingMessage) {
      // Edit existing message
      try {
        await databases.updateDocument(
          config.databaseId,
          config.messagesCollectionId,
          editingMessage.$id,
          {
            body: newMessage,
            edited: true,
          }
        );
        setEditingMessage(null);
        setNewMessage("");
        fetchMessages();
      } catch (error) {
        console.error("Error editing message:", error);
      }
    } else {
      // Send new message
      try {
        await databases.createDocument(
          config.databaseId,
          config.messagesCollectionId,
          ID.unique(),
          {
            groupId: groupId,
            senderId: currentUser.$id,
            senderName: currentUser.username,
            body: newMessage,
            timestamp: new Date().toISOString(),
            edited: false, // Initialize edited as false for new messages
          }
        );
        setNewMessage("");
        fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.messagesCollectionId,
        messageId
      );
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle editing a message
  const handleEditMessage = (message) => {
    Alert.alert(
      "Edit Message",
      "Do you want to edit this message?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setEditingMessage(message);
            setNewMessage(message.body);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="p-4 bg-blue-400 items-center flex-row">
          <Text className="text-lg font-pmedium text-white">{`${groupName} - ${sectionNumber}`}</Text>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <MessageBody
              item={item}
              currentUser={currentUser}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          inverted
        />
        <View className="flex-row p-4 bg-white border-gray-300">
          <TextInput
            className="flex-1 h-10 border border-gray-300 rounded px-2 mr-2"
            placeholder="Type a message"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity
            className="bg-green-500 py-2 px-4 rounded"
            onPress={handleSendMessage}
          >
            <Text className="text-white font-bold">
              {editingMessage ? "Edit" : "Send"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
