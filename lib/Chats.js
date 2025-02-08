import { Client, Databases, ID, Storage,  } from "react-native-appwrite";
import * as DocumentPicker from "expo-document-picker";
import { Alert, Platform } from "react-native";

const client = new Client();

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6788076500016f2de78d",
  platform: "com.jsm.sgcoa",
  databaseId: "67880997002b9f59b655",
  chatsId: "679b88120013fbdca49a",
  groupId: "679d0e7d001aba9e5d3b",
  messagesCollectionId: "679e66fc00311fade30e",
  storageId: "67a5a14e0004a30ec912",
};

client
  .setEndpoint(config.endpoint) //  Appwrite Endpoint
  .setProject(config.projectId) //  project ID
  .setPlatform(config.platform);

export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;

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

      console.log("Selected file:", file);

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
