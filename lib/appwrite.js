import { Account, Client, ID } from 'react-native-appwrite';
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.sgcoa',
    projectId: '6788076500016f2de78d',
    databaseId: '67880997002b9f59b655',
    userCollectionId: '678809cc0005f3484ccc',
    storageId: '67880b8b0015aa76fc65',
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;
const account = new Account(client);

export const createUser = () =>{
// Register User
account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe')
    .then(function (response) {
        console.log(response);
    }, function (error) {
        console.log(error);
    });    
}


