import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ID, Query } from "react-native-appwrite";
import { config, databases, getCurrentUser } from "../../lib/appwrite";
import CreateField from "../../components/CreateField";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { icons } from "../../constants";
import { router } from "expo-router";

const CreateJoin = () => {
  const [groupName, setGroupName] = useState("");
  const [sectionNumber, setSectionNumber] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the current user when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Validate the form fields
  const validateFields = () => {
    if (!groupName || !sectionNumber) {
      Alert.alert("Validation Error", "Both fields are required.");
      return false;
    }
    if (!/^\d{4}$/.test(sectionNumber)) {
      Alert.alert(
        "Validation Error",
        "Section number must be a 4-digit number."
      );
      return false;
    }
    return true;
  };

  // Handle form submission to create or find a group
  const generateAvatarUrl = (name) => {
    const initial = name; // Use the first letter found in the name
    return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff`;
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    if (!validateFields()) return;

    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId,
        [Query.equal("name", groupName), Query.equal("section", sectionNumber)]
      );

      if (response.documents.length > 0) {
        // Group already exists
        const existingGroup = response.documents[0];
        // Add current user to the group's participants if not already added
        if (!existingGroup.participants.includes(currentUser.$id)) {
          await databases.updateDocument(
            config.databaseId,
            config.groupId,
            existingGroup.$id,
            {
              participants: [...existingGroup.participants, currentUser.$id],
            }
          );
        }

        navigation.navigate("home", { groupId: existingGroup.$id }); // Navigate to home with existing group
      } else {
        // Create new group
        const avatarUrl = generateAvatarUrl(groupName);
        const newGroup = await databases.createDocument(
          config.databaseId,
          config.groupId,
          ID.unique(),
          {
            name: groupName,
            section: sectionNumber,
            userId: currentUser.$id, // Use currentUser.$id
            participants: [currentUser.$id],
            avatar: avatarUrl, // Add current user to participants
          }
        );
        navigation.navigate("home", { groupId: newGroup.$id }); // Navigate to home with new group
      }
    } catch (error) {
      console.error("Error creating or finding group:", error);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="p-4 my-2">
        <View className="flex-row items-center px-2">
          <TouchableOpacity onPress={() => router.push("home")}>
            <Image
              source={icons.leftArrow}
              className="w-6 h-6"
              resizeMode="contain"
              style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
            />
          </TouchableOpacity>
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl font-psemibold text-white">
              Find Your Group
            </Text>
          </View>
        </View>
        <View className="rounded-lg justify-center my-10">
          <CreateField
            title="Course Name"
            value={groupName}
            placeholder="Course Name"
            handleChangeText={setGroupName}
            otherStyles="mt-10"
          />
          <CreateField
            title="Section Number"
            value={sectionNumber}
            placeholder="Section Number"
            handleChangeText={setSectionNumber}
            otherStyles="mt-10"
          />
          <View className="flex-row justify-center mt-4">
            <CustomButton
              title="Submit"
              handlePress={handleSubmit}
              isLoading={isLoading}
              containerStyles="bg-blue-400 py-2 px-4 rounded w-full my-2"
              textStyles="text-white font-pmedium"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateJoin;
