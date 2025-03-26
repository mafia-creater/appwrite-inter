import { Client, Databases } from 'react-native-appwrite';
import { Platform } from "react-native";

const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: '67e04a47000d2aa438b3',
  
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

// Platform-specific configuration
switch (Platform.OS) {
  case 'ios':
    client.setPlatform("com.intermover.ios");
    break;
  case 'android':
    client.setPlatform("com.intermover.app");
    break;
}

// Initialize database
const database = new Databases(client);

export { client, database, config };