import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  RefreshControl,
  Linking,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  config,
  databases,
  getCurrentUser,
  signOut,
  updateUsername,
} from "../../lib/appwrite";
import ChangeUsername from "../../components/ChangeUsername";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import icons from "../../constants/icons";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [groupCount, setGroupCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Function to generate avatar URL based on username
  const generateAvatarUrl = (name) => {
    return `https://cloud.appwrite.io/v1/avatars/initials?name=${name}&project=${config.projectId}`;
  };

  // Fetch the current user and their groups when the component mounts
  const fetchUserAndGroups = async () => {
    try {
      const user = await getCurrentUser();
      setUserId(user.$id);
      setUsername(user.username);
      setAvatarUrl(generateAvatarUrl(user.username)); // Set the avatar URL
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId,
        [Query.search("participants", user.$id)]
      );
      setGroupCount(response.documents.length);
    } catch (error) {
      console.error("Error fetching user and groups:", error);
    }
  };

  useEffect(() => {
    fetchUserAndGroups();
  }, []);

  // Function to handle changing the username
  const handleUsernameChange = async () => {
    try {
      setIsLoading(true);
      await updateUsername(userId, newUsername);
      setAvatarUrl(generateAvatarUrl(newUsername));
      setUsername(newUsername);
      Alert.alert("Success", "Username changed successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert("Error", "Failed to change username.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle pull-to-refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndGroups();
    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full justify-center">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className=" flex-1 justify-center items-start flex-row m-3 ">
          <TouchableOpacity
            onPress={() => router.push("home")}
            className="absolute left-5"
          >
            <Image
              source={icons.leftArrow}
              className="w-6 h-6"
              resizeMode="contain"
              style={Platform.OS === "web" ? { width: 24, height: 24 } : {}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} className="absolute right-5">
            <Image
              source={icons.logout}
              resizeMode="contain"
              className="w-8 h-8"
              style={Platform.OS === "web" ? { width: 25, height: 25 } : {}}
            />
          </TouchableOpacity>
        </View>
        <View className="justify-center items-center p-10">
          <Text className="text-2xl text-blue-400 font-psemibold my-2">
            Welcome
          </Text>
          <Text className="text-white font-psemibold text-3xl">{username}</Text>
        </View>
        <View className="justify-center items-center flex-1 ">
          <View className="w-20 h-20 border border-blue-400 rounded-lg items-center justify-center">
            <Image
              source={{ uri: avatarUrl }} // Use the avatar URL
              className="w-[90%] h-[90%]"
              resizeMode="contain"
              style={
                Platform.OS === "web" ? { width: "90%", height: "90%" } : {}
              }
            />
          </View>
          <Text
            className="text-white font-psemibold my-10"
            style={Platform.OS === "web" ? { margin: 20 } : {}}
          >
            Total group chats{" "}
            <Text className="text-blue-400 text-medium font-bold text-center items-center">
              {groupCount}
            </Text>
          </Text>
        </View>

        <View className="my-9 p-4">
          <ChangeUsername
            title="Change your username"
            value={newUsername}
            placeholder=""
            handleChangeText={setNewUsername}
          />
          <CustomButton
            title="Show your new username!"
            handlePress={handleUsernameChange}
            isLoading={isLoading}
            containerStyles="my-8"
          />
        </View>
        <View className="justify-center items-center">
          <Text className="text-white text-base font-pextrabold text-center">
            Thank you for the support for senior year project!
          </Text>
          <Text className="text-white text-sx font-pextrabold my-2">
            For more details and new projects, visit my{" "}
          </Text>
        </View>
        <TouchableOpacity
          className="items-center justify-center px-2"
          onPress={() => Linking.openURL("https://github.com/AmmarAlshari")}
        >
          <Image
            source={icons.github}
            className="w-9 h-9 mb-5 items-center justify-center"
            resizeMode="contain"
            style={Platform.OS === "web" ? { width: 30, height: 30 } : {}}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
