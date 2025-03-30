import { Platform } from 'react-native';
import { Client, Account, Databases, Storage } from 'react-native-appwrite';

// Initialize Appwrite Client
const client = new Client();

// Set your Appwrite endpoint
client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject('67e04a47000d2aa438b3'); 

// Set platform-specific configuration
if (Platform.OS === 'ios') {
  // iOS configuration
  client.setPlatform("com.intermover.ios");
  console.log('Running on iOS');
} else if (Platform.OS === 'android') {
  // Android configuration
  client.setPlatform("com.intermover.app");
  console.log('Running on Android: com.intermover.app');
}

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Debug available methods
console.log('Account instance type:', typeof account);
console.log('Account prototype methods:', 
  Object.getOwnPropertyNames(Object.getPrototypeOf(account)));

export { client, account, databases, storage };