import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { databases, config } from "../../lib/Chats";
import { getCurrentUser } from "../../lib/appwrite";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  const fetchGroups = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId
      );
      setGroups(response.documents);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupName} className="font-pregular text-2xl">
        {item.name}
      </Text>
      <Text style={styles.sectionNumber} className="font-pregular text-2xl">
        Section: {item.section}
      </Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("ChatScreen", { groupId: item.$id })}
      >
        <Text style={styles.chatButtonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={groups}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome back
                </Text>
                <Text className="text-2xl font-psemibold text-blue-400">
                  {currentUser?.name}
                </Text>
              </View>
            </View>
            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Groups Found"
            description="You haven't joined any groups yet. Start by finding a group that interests you."
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionNumber: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: "#25D366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
