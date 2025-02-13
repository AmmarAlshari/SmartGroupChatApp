import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { RealtimeEvent } from "../../lib/Chats";
import { Query } from "react-native-appwrite";
import { config, databases, getCurrentUser } from "../../lib/appwrite";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import GroupItem from "../../components/GroupItem";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigation = useNavigation();

  // Fetch current user and groups
  const generateAvatarUrl = (name) => {
    return `https://cloud.appwrite.io/v1/avatars/initials?name=${name}&project=${config.projectId}`;
  };

  const fetchUserAndGroups = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setAvatarUrl(generateAvatarUrl(user.username));
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId,
        [Query.search("participants", user.$id)]
      );
      const groupsWithLastMessage = await Promise.all(
        response.documents.map(async (group) => {
          const messagesResponse = await databases.listDocuments(
            config.databaseId,
            config.messagesCollectionId,
            [
              Query.equal("groupId", group.$id),
              Query.orderDesc("timestamp"),
              Query.limit(1),
            ]
          );
          const lastMessage = messagesResponse.documents[0];
          return { ...group, lastMessage, avatar: group.avatar };
        })
      );
      setGroups(groupsWithLastMessage);
      setFilteredGroups(groupsWithLastMessage);
    } catch (error) {}
  };

  // Handle pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserAndGroups().then(() => setRefreshing(false));
  }, []);

  // Fetch user and groups when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserAndGroups();
    }, [])
  );

  // Handle search functionality
  const handleSearch = (query) => {
    if (query) {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  };
  // handlinig the realtime event for the last message
  useEffect(() => {
    const unsubscribe = RealtimeEvent((response) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.create")
      ) {
        fetchUserAndGroups();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView className="bg-primary flex-1">
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <GroupItem
            item={item}
            currentUser={currentUser}
            fetchGroups={fetchUserAndGroups}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="relative flex-row justify-between items-start mb-6">
              <View className="relative z-10 mt-4">
                {/* Add margin-top here */}
                <Text className="text-1xl text-gray-100 font-semibold">
                  Welcome back
                </Text>
                <View className="flex-row items-center mt-2">
                  <Image
                    source={{ uri: avatarUrl }} // Use the avatar URL
                    className="w-10 h-10 rounded-lg mr-2"
                    resizeMode="contain"
                    style={
                      Platform.OS === "web" ? { width: 40, height: 40 } : {}
                    }
                  />
                  <Text className="text-2xl font-semibold text-blue-400">
                    {currentUser?.username}
                  </Text>
                </View>
              </View>
            </View>
            <SearchInput onSearch={handleSearch} />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Groups Found"
            description="You haven't joined any groups yet. Start by finding a group that interests you."
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
};

export default Home;
