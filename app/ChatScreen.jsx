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
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  handleFilePick,
  handleSendMessage,
  RealtimeEvent,
  RealtimeFileEvent,
} from "../lib/Chats";
import { Query } from "react-native-appwrite";
import { config, databases, getCurrentUser } from "../lib/appwrite";
import MessageBody from "../components/MessageBody";
import icons from "../constants/icons";
import images from "../constants/images";
import { router } from "expo-router";

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

    // Subscribe to real-time updates
    const unsubscribeMessages = RealtimeEvent((response) => {
      if (
        response.events.includes(
          "databases.*.collections.*.documents.*.create"
        ) ||
        response.events.includes(
          "databases.*.collections.*.documents.*.update"
        ) ||
        response.events.includes("databases.*.collections.*.documents.*.delete")
      ) {
        fetchMessages();
      }
    });

    // Subscribe to file events
    const unsubscribeFiles = RealtimeFileEvent((response) => {
      if (response.events.includes("buckets.*.files.*.create")) {
        fetchMessages();
      }
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribeMessages();
      unsubscribeFiles();
    };
  }, []);

  //function to handle file pick
  const onFilePick = () => {
    handleFilePick((fileName, fileUrl) =>
      handleSendMessage(
        fileName,
        fileUrl,
        currentUser,
        groupId,
        newMessage,
        setNewMessage,
        editingMessage,
        setEditingMessage,
        fetchMessages
      )
    );
  };
  // Fetch messages for the group
  const fetchMessages = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.messagesCollectionId,
        [Query.equal("groupId", groupId), Query.orderDesc("timestamp")]
      );
      setMessages(response.documents);
    } catch (error) {}
  };

  // Fetch the current user
  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {}
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
    } catch (error) {}
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
    } catch (error) {}
  };

  // Handle editing a message
  const handleEditMessage = (message) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Edit Message: Do you want to edit this message?"
      );
      if (confirmed) {
        setEditingMessage(message);
        setNewMessage(message.body);
      }
    } else {
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
    }
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          className="px-5 items-center flex-row justify-between"
          style={{ backgroundColor: "rgba(44, 44, 44, 0.1)" }}
        >
          <TouchableOpacity onPress={() => router.push("home")}>
            <Image
              source={icons.leftArrow}
              className="w-6 h-6"
              resizeMode="contain"
              style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
            />
          </TouchableOpacity>

          <Text className="text-lg font-pregular text-white">{`${groupName} - ${sectionNumber}`}</Text>
          <Image
            source={images.logo}
            className="w-20 h-20"
            resizeMode="contain"
            style={Platform.OS === "web" ? { width: 55, height: 70 } : {}}
          />
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
        <View
          className="flex-row py-2  border-gray-300 items-center justify-center"
          style={{ backgroundColor: "rgba(44, 44, 44, 0.1)" }}
        >
          <TouchableOpacity onPress={onFilePick} className="p-3 m-1">
            <Image
              source={icons.plus}
              className="w-6 h-6"
              resizeMode="contain"
              style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
            />
          </TouchableOpacity>
          <TextInput
            className="flex-1 h-11 items-center text-white font-pmedium rounded-full px-3 mr-4 ml-4 text-medium"
            style={{ backgroundColor: "rgba(44, 44, 44, 0.2)" }}
            placeholder=""
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity
            className="p-3 m-1"
            onPress={() =>
              handleSendMessage(
                newMessage,
                null,
                currentUser,
                groupId,
                newMessage,
                setNewMessage,
                editingMessage,
                setEditingMessage,
                fetchMessages
              )
            }
          >
            <Text className="text-white font-pregular">
              {editingMessage ? (
                "Edit"
              ) : (
                <Image
                  source={icons.bookmark}
                  className="w-6 h-6"
                  resizeMode="contain"
                  style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
                />
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
