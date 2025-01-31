import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { databases, config } from '../lib/Chats';
import { ID } from 'react-native-appwrite';

const CreateGroup = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const navigation = useNavigation();

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    databases.createDocument(
      config.databaseId,
      config.groupId,
      ID.unique(),
      {
        name: groupName
      }
    ).then(() => {
      console.log("Group Name:", groupName);
      setModalVisible(false);
      navigation.navigate('Chats'); // Navigate to Chats screen
    }).catch((error) => {
      console.error("Error creating group:", error);
    });
  };

  return (
    <View style={styles.container}>
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
              placeholder="Enter group name"
              onChangeText={(text) => setGroupName(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#0088cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0088cc',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#0088cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroup;