import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { databases, config } from "../../lib/Chats";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";
import { useCallback } from "react";
import { ID, Query } from 'react-native-appwrite';

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [sectionNumber, setSectionNumber] = useState("");
  const navigation = useNavigation();

  const fetchGroups = async () => {
    try {
      const response = await databases.listDocuments(config.databaseId, config.groupId);
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

  const handleSubmit = async () => {
    try {
      const response = await databases.listDocuments(config.databaseId, config.groupId, [
        Query.equal('name', groupName),
        Query.equal('section', sectionNumber)
      ]);

      if (response.documents.length > 0) {
        // Group already exists
        const existingGroup = response.documents[0];
        console.log("Existing Group:", existingGroup);
        navigation.navigate('ChatScreen', { groupId: existingGroup.$id }); // Navigate to ChatScreen with existing group
      } else {
        // Create new group
        const newGroup = await databases.createDocument(config.databaseId, config.groupId, ID.unique(), {
          name: groupName,
          section: sectionNumber,
        });
        console.log("New Group:", newGroup);
        navigation.navigate('ChatScreen', { groupId: newGroup.$id }); // Navigate to ChatScreen with new group
      }
    } catch (error) {
      console.error("Error creating or finding group:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupName} className="font-pregular text-2xl">{item.name}</Text>
      <Text style={styles.sectionNumber} className="font-pregular text-2xl">Section: {item.section}</Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatScreen', { groupId: item.$id })}
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
                  Ammar
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
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sectionNumber: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;