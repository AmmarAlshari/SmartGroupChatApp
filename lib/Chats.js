import { Client, Databases } from "react-native-appwrite";

const client = new Client();

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "6788076500016f2de78d",
  platform: "com.jsm.sgcoa",
  databaseId: "67880997002b9f59b655",
  chatsId: "679b88120013fbdca49a",
  groupId: "679d0e7d001aba9e5d3b",
  messagesCollectionId: "679e66fc00311fade30e",
};

client
  .setEndpoint(config.endpoint) //  Appwrite Endpoint
  .setProject(config.projectId) //  project ID
  .setPlatform(config.platform);

export const databases = new Databases(client);

export default client;
