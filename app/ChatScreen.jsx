import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, config } from "../lib/Chats";
import { ID, Query } from "react-native-appwrite";
import { getCurrentUser } from "../lib/appwrite";

const ChatScreen = () => {
  const route = useRoute();
  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchCurrentUser();
    fetchGroupName();
  }, []);

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

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchGroupName = async () => {
    try {
      const response = await databases.getDocument(config.databaseId, config.groupId, groupId);
      setGroupName(response.name);
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) return;

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
        }
      );
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await databases.deleteDocument(config.databaseId, config.messagesCollectionId, messageId);
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleEditMessage = async (messageId, newBody) => {
    try {
      await databases.updateDocument(config.databaseId, config.messagesCollectionId, messageId, {
        body: newBody,
      });
      fetchMessages();
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUser?.$id
          ? styles.otherMessage
          : styles.myMessage,
      ]}
    >
      <Text style={styles.senderName}>{item.senderName}</Text>
      <Text style={styles.messageText}>{item.body}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      {item.senderId === currentUser?.$id && (
        <View style={styles.messageActions}>
          <TouchableOpacity
            onPress={() => {
              Alert.prompt(
                "Edit Message",
                "Enter new message:",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Save",
                    onPress: (newBody) => handleEditMessage(item.$id, newBody),
                  },
                ],
                {
                  cancelable: true,
                  onDismiss: () => {},
                }
              );
            }}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteMessage(item.$id)}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>{groupName}</Text>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#0088cc",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "white",
    alignSelf: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
  },
  messageActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  actionText: {
    fontSize: 12,
    color: "#0088cc",
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#25D366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatScreen;