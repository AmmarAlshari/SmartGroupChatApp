import { Alert, Platform } from "react-native";
import { config, databases } from "./appwrite";
import { router } from "expo-router";

// List of suspicious words
const suspiciousWords = ["افضل عروض لحل الواجبات", "افضل مدرس خصوصي"]; // Add your list of suspicious words here

// Function to check messages for suspicious words
export const checkMessageForSuspiciousWords = (message) => {
  for (const word of suspiciousWords) {
    if (message.includes(word)) {
      return true;
    }
  }
  return false;
};

// Function to warn users and remove repeat offenders
export const warnUser = async (userId, groupId) => {
  try {
    let userWarnings;

    try {
      userWarnings = await databases.getDocument(
        config.databaseId,
        config.warningsCollectionId,
        userId
      );
    } catch (error) {
      if (error.code === 404) {
        // Document not found, create a new one
        userWarnings = await databases.createDocument(
          config.databaseId,
          config.warningsCollectionId,
          userId,
          {
            userId: userId,
            count: 0,
            lastWarning: new Date().toISOString(),
            kickoutTime: null,
          } // Include userId, count, lastWarning, and kickoutTime attributes
        );
      } else {
        throw error;
      }
    }

    // Check if 24 hours have passed since the last warning
    const lastWarningDate = new Date(userWarnings.lastWarning);
    const currentDate = new Date();
    const hoursDifference = Math.abs(currentDate - lastWarningDate) / 36e5;

    if (hoursDifference >= 24) {
      // Reset the count if 24 hours have passed
      userWarnings.count = 0;
    }

    userWarnings.count += 1;
    userWarnings.lastWarning = currentDate.toISOString();
    await databases.updateDocument(
      config.databaseId,
      config.warningsCollectionId,
      userWarnings.$id,
      {
        userId: userWarnings.userId,
        count: userWarnings.count,
        lastWarning: userWarnings.lastWarning,
      } // Include userId, count, and lastWarning attributes
    );

    if (userWarnings.count >= 5) {
      // Remove user from the group and set kickout time
      const group = await databases.getDocument(
        config.databaseId,
        config.groupId,
        groupId
      );
      const updatedParticipants = group.participants.filter(
        (participant) => participant !== userId
      );
      await databases.updateDocument(
        config.databaseId,
        config.groupId,
        groupId,
        { participants: updatedParticipants }
      );

      userWarnings.kickoutTime = currentDate.toISOString();
      await databases.updateDocument(
        config.databaseId,
        config.warningsCollectionId,
        userWarnings.$id,
        { kickoutTime: userWarnings.kickoutTime }
      );

      if (Platform.OS === "web") {
        window.alert(
          "Removed from Group: You have been removed from the group due to repeated suspicious messages."
        );
      } else {
        Alert.alert(
          "Removed from Group",
          "You have been removed from the group due to repeated suspicious messages."
        );
      }
      router.push("home"); // Redirect to home page
    } else {
      const attemptsLeft = 5 - userWarnings.count;
      if (Platform.OS === "web") {
        window.alert(
          `Warning: Your message contains suspicious content. You have ${attemptsLeft} attempts left before getting kicked from the group.`
        );
      } else {
        Alert.alert(
          "Warning",
          `Your message contains suspicious content. You have ${attemptsLeft} attempts left before getting kicked from the group.`
        );
      }
    }
  } catch (error) {
    console.error("Error warning user:", error);
  }
};
