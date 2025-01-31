import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { databases, config } from '../../lib/Chats';
import { useNavigation } from '@react-navigation/native';

const Chats = () => {
  const [groups, setGroups] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await databases.listDocuments(config.databaseId, config.groupId);
      setGroups(response.documents);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatScreen', { groupId: item.$id })}
      >
        <Text style={styles.chatButtonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 70, // Increased padding to move items further down
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: '#25D366',
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

export default Chats;