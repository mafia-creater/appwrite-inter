import { ID, Query } from 'react-native-appwrite';
import { Client, Account, Databases, Storage } from 'react-native-appwrite';

// Initialize Appwrite Client directly in this file
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject('67e04a47000d2aa438b3');

// Set platform identifier based on your app
client.setPlatform("com.intermover.app");

// Initialize services directly
const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);

// Define your database and collection IDs
const DATABASE_ID = '67e3f0450005208dcedc';
const PROFILES_COLLECTION_ID = '67e3f0540010aa16d205';
const EVENTS_COLLECTION_ID = '67e424f0000ee6d790ad'; 
const storageId = '67e8f9ef001984a06104';

export class AuthService {
  // Register a new user
  async createAccount(email, password, fullname) {
    try {
      // Create the account in Appwrite
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        fullname
      );
      
      // Create a basic user profile
      if (newAccount) {
        await this.createUserProfile({
          userId: newAccount.$id,
          email: email,
          fullname: fullname
        });
      }
      
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
  
      // Provide more user-friendly error messages
      if (error.code === 401) {
        throw new Error('Permission denied. Please contact support.');
      } else if (error.message.includes('unique')) {
        throw new Error('This email is already registered.');
      } else {
        throw new Error('Could not create account. Please try again.');
      }
    }
  }

  // Create initial user profile in database
  async createUserProfile(userData) {
    try {
      const profile = await databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId: userData.userId,
          email: userData.email,
          fullname: userData.fullname,
          createdAt: new Date().toISOString(),
          // Other fields will be null until user completes their profile
          phone: null,
          university: null,
          course: null,
          nationality: null,
          interests: null,
          profileComplete: false
        }
      );
      
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Update user profile with additional information
  async updateUserProfile(userId, profileData) {
    try {
      // First find the profile document by userId
      const profiles = await databases.listDocuments(
        DATABASE_ID, 
        PROFILES_COLLECTION_ID,
        [
          Query.equal('userId', userId)
        ]
      );
      
      // If profile exists, update it
      if (profiles.documents.length > 0) {
        const profileId = profiles.documents[0].$id;
        
        // Filter out any system properties that might have been fetched
        const cleanedData = { ...profileData };
        
        // Remove any system properties (those starting with $)
        Object.keys(cleanedData).forEach(key => {
          if (key.startsWith('$')) {
            delete cleanedData[key];
          }
        });
        
        // Also remove specific system fields we know might cause issues
        const fieldsToRemove = ['$id', '$databaseId', '$collectionId', '$createdAt', '$updatedAt', '$permissions'];
        fieldsToRemove.forEach(field => {
          if (field in cleanedData) {
            delete cleanedData[field];
          }
        });
        
        const updatedProfile = await databases.updateDocument(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          profileId,
          {
            ...cleanedData,
            profileComplete: true,
            updatedAt: new Date().toISOString()
          }
        );
        
        return updatedProfile;
      } else {
        throw new Error('Profile not found');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Login user - using a method that matches your SDK version
  async login(email, password) {
    try {
      console.log('Login attempt with:', email);
      console.log('Using createEmailPasswordSession method');
      
      // Using the method available in your SDK according to the logs
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Login successful');
      return session;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) return null;
      
      const profiles = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      
      if (profiles.documents.length > 0) {
        return profiles.documents[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

//


class EventsService {
    // Get all events
    async getEvents() {
      try {
        const events = await databases.listDocuments(
          DATABASE_ID,
          EVENTS_COLLECTION_ID
        );
        
        return events.documents;
      } catch (error) {
        console.error('Error getting events:', error);
        throw error;
      }
    }
    
    // Get event by ID
    async getEvent(eventId) {
      try {
        return await databases.getDocument(
          DATABASE_ID,
          EVENTS_COLLECTION_ID,
          eventId
        );
      } catch (error) {
        console.error('Error getting event:', error);
        throw error;
      }
    }
    
    // Create a new event
    async createEvent(eventData, imageFile) {
      try {
        let imageUrl = '';
        
        // Upload image if provided
        if (imageFile) {
          const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            imageFile
          );
          
          // Get file preview URL
          imageUrl = storage.getFilePreview(
            storageId,
            uploadedFile.$id,
            600, // width
            300, // height
            'center', // gravity
            100 // quality
          );
        }
        
        // Create event document
        return await databases.createDocument(
          DATABASE_ID,
          EVENTS_COLLECTION_ID,
          ID.unique(),
          {
            ...eventData,
            image_url: imageUrl, // Changed from 'image' to 'image_url' to match schema
            attendees: 0,
          }
        );
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    }
    
    // Update an event
    async updateEvent(eventId, eventData, imageFile) {
      try {
        const event = await this.getEvent(eventId);
        let imageUrl = event.image_url || ''; // Using image_url instead of image
        
        // Upload new image if provided
        if (imageFile) {
          // We don't have imageId stored, so we can't delete the old image
          // If you need to delete old images, you'll need a different approach
          
          // Upload new image
          const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            imageFile
          );
          
          // Get file preview URL
          imageUrl = storage.getFilePreview(
            storageId,
            uploadedFile.$id,
            600, // width
            300, // height
            'center', // gravity
            100 // quality
          );
        }
        
        // Update event document
        return await databases.updateDocument(
          DATABASE_ID,
          EVENTS_COLLECTION_ID,
          eventId,
          {
            ...eventData,
            image_url: imageUrl, // Changed from 'image' to 'image_url'
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (error) {
        console.error('Error updating event:', error);
        throw error;
      }
    }
    
    // Delete an event
    async deleteEvent(eventId) {
      try {
        // We can't easily delete the image since we don't store the imageId
        // If you need to track and delete images, consider adding a separate field
        // or collection to track uploaded files
        
        // Delete event document
        return await databases.deleteDocument(
          DATABASE_ID,
          EVENTS_COLLECTION_ID,
          eventId
        );
      } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
    }
    
    // Join an event
    async joinEvent(eventId, userId) {
        try {
          // Get current event
          const event = await this.getEvent(eventId);
          
          // Create attendance record
          await databases.createDocument(
            DATABASE_ID,
            '67e4266c00359e946aa2',
            ID.unique(),
            {
              events: eventId,
              user: userId,
              status: 'pending'
            }
          );
          
          // Increment attendees count
          return await databases.updateDocument(
            DATABASE_ID,
            EVENTS_COLLECTION_ID,
            eventId,
            {
              attendees: event.attendees + 1,
            }
          );
        } catch (error) {
          console.error('Error joining event:', error);
          throw error;
        }
      }
    
    // Check if user is attending an event
    async isUserAttending(eventId, userId) {
        try {
        const attendees = await databases.listDocuments(
            DATABASE_ID,
            '67e4266c00359e946aa2',
            [
            Query.equal('events', eventId),
            Query.equal('user', userId)
            ]
        );
        
        return attendees.documents.length > 0;
        } catch (error) {
        console.error('Error checking attendance:', error);
        return false;
        }
    }
  }
  
export const eventsService = new EventsService();