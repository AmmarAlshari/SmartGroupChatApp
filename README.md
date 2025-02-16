# SmartGroupChatApp

SmartGroupChatApp is a group chat application designed to facilitate communication and collaboration among university studens. The app includes features such as real-time messaging, file sharing, and user management. It also includes mechanisms to detect and warn users about suspicious content.

## Features

- **Real-time Messaging**: Send and receive messages in real-time.
- **File Sharing**: Share files such as PDFs and DOCs within the chat.
- **User Management**: Manage users, including warning and kicking out users for suspicious behavior.
- **Suspicious Content Detection**: Detect and highlight suspicious words in messages.
- **Responsive Design**: Works on both web and mobile platforms.

## Technologies Used

- **React Native**: For building the mobile application.
- **Expo**: For developing and testing the app.
- **Appwrite**: For backend services including authentication, database, and storage.
- **JavaScript**: For programming the application logic.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AmmarAlshari/SmartGroupChatApp.git
   cd SmartGroupChatApp

   ```

2. **Install dependencies:**
   
   ```bash
   npm install
   ```
   
4. **Set up Appwrite:**

   1. Create an Appwrite project.
   2. Set up the necessary collections and storage buckets.
   3. Update the config.js file with your Appwrite project details.

5. **Run the application:**

   ```bash
   expo start
   ```

   Usage:

      1. Sign Up / Log In: Create an account or log in to an existing account.
      2. Create / Join Group: Create a new group or join an existing group by providing the group name and section number.
      3. Send Messages: Send text messages or share files within the group.
      4. Manage Users: Admins can warn or kick out users for suspicious behavior.

   Suspicious Content Detection:
   
   The app includes a mechanism to detect and warn users about suspicious content. The list of suspicious words can be found in the AI-Mod.js file. When a user sends a message containing suspicious words, they will receive a warning. After multiple warnings, the user will be kicked out of the group.
   
   Contributing:
   
   Contributions are welcome! Please fork the repository and create a pull request with your changes.
   
   License:
   
   This project is licensed under the MIT License. See the LICENSE file for details.
   
   Contact:
   
   For any questions or inquiries, please contact aalshaaery@gmail.com
