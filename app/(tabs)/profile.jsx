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
import { getCurrentUser, signOut, updateUsername } from "../../lib/appwrite";
import ChangeUsername from "../../components/ChangeUsername";
import { Query } from "react-native-appwrite";
import { config } from "../../lib/Chats";
import { databases } from "../../lib/Chats";
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

  // Fetch the current user and their groups when the component mounts
  const fetchUserAndGroups = async () => {
    try {
      const user = await getCurrentUser();
      setUserId(user.$id);
      setUsername(user.username);
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId,
        [Query.search("participants", user.$id)]
      );
      setGroupCount(response.documents.length);
    } catch (error) {}
  };

  useEffect(() => {
    fetchUserAndGroups();
  }, []);

  // Function to handle changing the username
  const handleUsernameChange = async () => {
    try {
      await updateUsername(userId, newUsername);
      setUsername(newUsername);
      Alert.alert("Success", "Username changed successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to change username.");
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
    <SafeAreaView className="bg-primary h-full">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className=" flex-1 justify-center items-center flex-row p-6">
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
        <View className="justify-center items-center m-3 p-2">
          <Text className="text-xl text-blue-400 font-psemibold my-2">
            Welcome
          </Text>
          <Text className="text-white font-psemibold text-3xl">{username}</Text>
        </View>
        <View className="justify-center items-center m-5">
          <View className="w-16 h-16">
            <Image
              source={icons.groups}
              className="w-[90%] h-[90%]"
              resizeMode="contain"
              style={
                Platform.OS === "web" ? { width: "90%", height: "90%" } : {}
              }
            />
          </View>
          <Text className="text-white font-psemibold my-3">
            Your Groups!{" "}
            <Text className="text-blue-400 text-xl font-bold">
              {groupCount}
            </Text>
          </Text>
        </View>

        <View className="my-6 p-4">
          <ChangeUsername
            title="Change your username"
            value={newUsername}
            placeholder="Enter new username"
            handleChangeText={setNewUsername}
          />
          <CustomButton
            title="Show your new username!"
            handlePress={handleUsernameChange}
            isLoading={isLoading}
            containerStyles="my-10"
          />
        </View>
        <View className="justify-center items-center border border-gray-300 p-2 rounded-xl">
          <Text className="text-white text-xl font-pregular text-center">
            Thank you for supporting my senior year project!
          </Text>
          <Text className="text-white text-sx font-pregular my-2">
            For more details and new projects, visit my{" "}
            <Text
              onPress={() => Linking.openURL("https://github.com/AmmarAlshari")}
              className="text-blue-400 font-bold text-xl text-center"
            >
              GitHub
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
