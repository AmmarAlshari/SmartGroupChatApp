import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  APPWRITE_STORAGE_ID,
  APPWRITE_GROUP_ID,
  APPWRITE_MESSAGES_COLLECTION_ID,
  APPWRITE_WARNINGS_COLLECTION_ID,
  APPWRITE_PLATFORM,
} from "@env";
export const config = {
  endpoint: APPWRITE_ENDPOINT,
  platform: APPWRITE_PLATFORM,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  userCollectionId: APPWRITE_USER_COLLECTION_ID,
  storageId: APPWRITE_STORAGE_ID,
  groupId: APPWRITE_GROUP_ID,
  messagesCollectionId: APPWRITE_MESSAGES_COLLECTION_ID,
  warningsCollectionId: APPWRITE_WARNINGS_COLLECTION_ID,
};

// Init your React Native SDK
export const client = new Client();
export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

client
  .setEndpoint(config.endpoint) //  Appwrite Endpoint
  .setProject(config.projectId) //  project ID
  .setPlatform(config.platform); //  application ID or bundle ID.

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    console.log(newAccount);

    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );
    account.createVerification("http://localhost:8081/Verification");
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// checks active session
export const checkActiveSession = async () => {
  try {
    const session = await account.getSession("current"); // Get the current session
    return session !== null; // Return true if there is an active session
  } catch (error) {
    // If there's an error (e.g., no active session), handle it appropriately
    if (error.code === 401) {
      return false; // No active session
    }
    throw error; // Re-throw other unexpected errors
  }
};

// Function to delete all sessions for the current user
export const deleteSessions = async () => {
  try {
    // Get the list of all sessions
    const sessions = await account.listSessions();

    // Delete each session
    await Promise.all(
      sessions.sessions.map(async (session) => {
        await account.deleteSession(session.$id);
      })
    );

    console.log("All sessions deleted successfully");
  } catch (error) {
    console.error("Error deleting sessions:", error.message);
    throw error; // Re-throw the error for further handling
  }
};

// Get Current User
export async function getCurrentUser() {
  try {
    // Get the current account details
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account found");

    // Fetch the user document from the database using the account ID
    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("No user document found");

    // Return the first user document found
    return {
      ...currentUser.documents[0],
      name: currentAccount.name, // Ensure the name is included
    };
  } catch (error) {
    return null;
  }
}

// function to update username
export const updateUsername = async (userId, newUsername) => {
  try {
    // Update the user's preferences
    await account.updatePrefs({ username: newUsername });

    // Update the username in the database
    return await databases.updateDocument(
      config.databaseId,
      config.userCollectionId,
      userId,
      {
        username: newUsername,
      }
    );
  } catch (error) {
    console.error("Error updating username:", error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error(error);
  }
};
