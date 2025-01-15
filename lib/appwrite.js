import { Account, Avatars, Client, Databases, ID } from 'react-native-appwrite';
export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.sgcoa',
    projectId: '6788076500016f2de78d',
    databaseId: '67880997002b9f59b655',
    userCollectionId: '6788221c000bb155ca4a',
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
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) =>{
// creating new user
 try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
    )

      if(!newAccount) throw Error;

      const avatarUrl = avatars.getInitials(username)

      await signIn(email, password);

      // add new user in database
      const newUser = await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
          accountId: newAccount.$id,
          email,
          username,
          avatar: avatarUrl,
        }
      )

      return newUser;

 } catch (error) {
  console.log(error);
  throw new Error(error);
  
  
 }
}

export async function signIn(email,password) {
  try {
    const session = await account.createEmailPasswordSession
    (email,password)
    return session
  } catch (error) {
    throw new Error(error);
  }
}


