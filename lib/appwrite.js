import { Platform } from 'react-native';
import { Account, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

// Appwrite configuration
const endpoint = 'https://cloud.appwrite.io/v1'; // Replace with your Appwrite endpoint if self-hosted
const projectId = '67e04a47000d2aa438b3'; // Replace with your project ID

// Initialize Appwrite client
const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

switch (Platform.OS) {
  case 'ios':
    client.setPlatform("com.intermover.ios");
    break;
  case 'android':
    client.setPlatform("com.intermover.app");
    break;
}


// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database and collection IDs (from your provided screenshot)
const databaseId = '67e3f04500052080dcefcd'; // Update with your correct database ID
const profileCollectionId = '67e3f05400108a16d205'; // Update with your correct collection ID

// Authentication functions
const appwriteService = {
  // Create a new account
  createAccount: async (email, password, name) => {
    try {
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (newAccount) {
        // Login after successful account creation
        return await appwriteService.login(email, password);
      }
      
      return newAccount;
    } catch (error) {
      console.error('Appwrite service :: createAccount :: error', error);
      throw error;
    }
  },
  
  // Login to account
  login: async (email, password) => {
    try {
      return await account.createEmailSession(email, password);
    } catch (error) {
      console.error('Appwrite service :: login :: error', error);
      throw error;
    }
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const user = await account.get();
      
      if (user) {
        // Get the user's profile
        const profile = await appwriteService.getUserProfile(user.$id);
        return { ...user, profile };
      }
      
      return null;
    } catch (error) {
      console.error('Appwrite service :: getCurrentUser :: error', error);
      return null;
    }
  },
  
  // Get user profile from database
  getUserProfile: async (userId) => {
    try {
      const profile = await databases.listDocuments(
        databaseId,
        profileCollectionId,
        [Query.equal('userId', userId)]
      );
      
      if (profile.documents.length > 0) {
        return profile.documents[0];
      }
      
      return null;
    } catch (error) {
      console.error('Appwrite service :: getUserProfile :: error', error);
      return null;
    }
  },
  
  // Create or update user profile
  updateProfile: async (userData) => {
    try {
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Check if profile already exists
      const existingProfile = await appwriteService.getUserProfile(currentUser.$id);
      
      if (existingProfile) {
        // Update existing profile
        return await databases.updateDocument(
          databaseId,
          profileCollectionId,
          existingProfile.$id,
          {
            ...userData,
            userId: currentUser.$id,
            email: currentUser.email
          }
        );
      } else {
        // Create new profile
        return await databases.createDocument(
          databaseId,
          profileCollectionId,
          ID.unique(),
          {
            ...userData,
            userId: currentUser.$id,
            email: currentUser.email
          }
        );
      }
    } catch (error) {
      console.error('Appwrite service :: updateProfile :: error', error);
      throw error;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite service :: logout :: error', error);
      throw error;
    }
  },
  
  // Upload avatar image
  uploadAvatar: async (file) => {
    try {
      const response = await storage.createFile(
        'YOUR_BUCKET_ID', // Replace with your actual bucket ID
        ID.unique(),
        file
      );
      return response;
    } catch (error) {
      console.error('Appwrite service :: uploadAvatar :: error', error);
      throw error;
    }
  }
};

export default appwriteService;