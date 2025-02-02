import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { databases, config } from "../lib/Chats";
import { ID, Query } from "react-native-appwrite";
import { getCurrentUser } from "../lib/appwrite";

const CreateGroup = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [sectionNumber, setSectionNumber] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.groupId,
        [Query.equal("name", groupName), Query.equal("section", sectionNumber)]
      );

      if (response.documents.length > 0) {
        // Group already exists
        const existingGroup = response.documents[0];
        console.log("Existing Group:", existingGroup);

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

        setModalVisible(false);
        navigation.navigate("home", { groupId: existingGroup.$id }); // Navigate to ChatScreen with existing group
      } else {
        // Create new group
        const newGroup = await databases.createDocument(
          config.databaseId,
          config.groupId,
          ID.unique(),
          {
            name: groupName,
            section: sectionNumber,
            userId: currentUser.$id, // Use currentUser.$id
            participants: [currentUser.$id], // Add current user to participants
          }
        );
        console.log("New Group:", newGroup);
        setModalVisible(false);
        navigation.navigate("home", { groupId: newGroup.$id }); // Navigate to ChatScreen with new group
      }
    } catch (error) {
      console.error("Error creating or finding group:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find your group</Text>
      <TouchableOpacity style={styles.openButton} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>Find your group</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Find your group</Text>
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              placeholderTextColor="#888"
              onChangeText={(text) => setGroupName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Section Number"
              placeholderTextColor="#888"
              onChangeText={(text) => setSectionNumber(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0088cc",
    alignSelf: "flex-start",
  },
  openButton: {
    backgroundColor: "#0088cc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
    elevation: 5,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#0088cc",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "#000", // Ensure text color is set
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#0088cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateGroup;
