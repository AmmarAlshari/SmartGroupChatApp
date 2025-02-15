import { ID } from "react-native-appwrite";
import * as DocumentPicker from "expo-document-picker";
import { Alert, Platform } from "react-native";
import { client, config, databases, storage } from "./appwrite";
import { checkMessageForSuspiciousWords, warnUser } from "../lib/AI-Mod";

// Function to handle sending a new message or editing an existing message
export const handleSendMessage = async (
  text,
  fileUrl = null,
  currentUser,
  groupId,
  newMessage,
  setNewMessage,
  editingMessage,
  setEditingMessage,
  fetchMessages
) => {
  if (!currentUser) return;

  if (checkMessageForSuspiciousWords(newMessage)) {
    await warnUser(currentUser.$id, groupId);
    return;
  }

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
          body: fileUrl ? `File: ${text}` : newMessage,
          timestamp: new Date().toISOString(),
          edited: false,
          fileUrl: fileUrl,
        }
      );
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};

//function to handle file pick
export const handleFilePick = async (handleSendMessage) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];
      const fileType = file.mimeType;

      if (
        fileType !== "application/pdf" &&
        fileType !== "application/msword" &&
        fileType !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        Alert.alert(
          "Invalid File Type",
          "Only PDF and DOC files are accepted."
        );
        return;
      }

      let fileResponse;
      if (Platform.OS === "web") {
        const fileBlob = await fetch(file.uri).then((r) => r.blob());
        fileResponse = await storage.createFile(
          config.storageId,
          ID.unique(),
          fileBlob
        );
      } else {
        fileResponse = await storage.createFile(
          config.storageId,
          ID.unique(),
          file
        );
      }

      if (!fileResponse || !fileResponse.$id) {
        throw new Error("Failed to upload file");
      }

      const fileUrl = storage.getFileView(config.storageId, fileResponse.$id);
      handleSendMessage(file.name, fileUrl);
    }
  } catch (error) {
    console.error("File upload error:", error);
    Alert.alert("Upload Failed", "Something went wrong.");
  }
};

// Function to handle real-time events with reconnection logic
export const RealtimeEvent = (callback) => {
  const subscribe = () => {
    try {
      const unsubscribe = client.subscribe(
        `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents`,
        (response) => {
          callback(response);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Realtime subscription error:", error);
      Alert.alert("Connection Lost", "Reconnecting...");
      setTimeout(subscribe, 5000); // Retry after 5 seconds
    }
  };

  return subscribe();
};

// Function to handle real-time events for group creation with reconnection logic
export const RealtimeGroupEvent = (callback) => {
  const subscribe = () => {
    try {
      const unsubscribe = client.subscribe(
        `databases.${config.databaseId}.collections.${config.groupId}.documents`,
        (response) => {
          callback(response);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Realtime subscription error:", error);
      Alert.alert("Connection Lost", "Reconnecting...");
      setTimeout(subscribe, 5000); // Retry after 5 seconds
    }
  };

  return subscribe();
};

// Function to handle real-time file events with reconnection logic
export const RealtimeFileEvent = (callback) => {
  const subscribe = () => {
    try {
      const unsubscribe = client.subscribe(
        `buckets.${config.storageId}.files`,
        (response) => {
          callback(response);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Realtime subscription error:", error);
      Alert.alert("Connection Lost", "Reconnecting...");
      setTimeout(subscribe, 5000); // Retry after 5 seconds
    }
  };

  return subscribe();
};
