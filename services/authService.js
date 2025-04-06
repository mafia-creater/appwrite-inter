import { ID, Query } from 'react-native-appwrite';
import { Client, Account, Databases, Storage } from 'react-native-appwrite';

 // Ensure you have this package installed


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
const HOUSING_COLLECTION_ID = '67e427420038f517a001';
const MESSAGES_COLLECTION_ID = '67ee24d500114f897c22';
const RESOURCES_COLLECTION_ID = '67f22522003308240bb2';
const POSTS_COLLECTION_ID = '67e40278001532736fbd';
const COMMENTS_COLLECTION_ID = '67f28e49003d6740aa39'; 


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

class HousingService {
  // Get all housing listings
  async getHousingListings() {
    try {
      const listings = await databases.listDocuments(
        DATABASE_ID,
        HOUSING_COLLECTION_ID
      );
      
      return listings.documents;
    } catch (error) {
      console.error('Error getting housing listings:', error);
      throw error;
    }
  }

  // Get housing listings by user ID
  async searchProfiles(ownerId) {
    try {
      const DATABASE_ID = '67e3f0450005208dcedc';
      const PROFILES_COLLECTION_ID = '67e3f0540010aa16d205';
      
      // Import Query directly to prevent errors
      const { Query } = require('react-native-appwrite');
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('userId', ownerId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error("Error searching profiles:", error);
      return [];
    }
  }
  
  // Get housing listing by ID
  async getHousingListing(listingId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        listingId
      );
    } catch (error) {
      console.error('Error getting housing listing:', error);
      throw error;
    }
  }
  
  // Create a new housing listing
  async createHousingListing(listingData, imageFiles = []) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to create a listing');
      }
      
      // Process and upload images
      const imageUrls = [];
      
      if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          try {
            // Validate image file has the required properties
            if (!imageFile.uri) {
              console.error('Image file missing URI property:', imageFile);
              continue;
            }
            
            console.log('Uploading image:', imageFile);
            
            // Generate a unique ID for the file
            const fileId = ID.unique();
            
            // Upload file to storage
            const uploadedFile = await storage.createFile(
              storageId,
              fileId,
              imageFile
            );
            
            console.log('Upload successful with ID:', uploadedFile.$id);
            
            // Generate the file view URL
            const imageUrl = storage.getFileView(
              storageId,
              uploadedFile.$id
            );
            
            imageUrls.push(imageUrl);
          } catch (uploadError) {
            console.error('Error uploading individual image:', uploadError);
            // Continue with the next image
          }
        }
      }
      
      console.log('Final image URLs:', imageUrls);
      
      // Create housing document
      return await databases.createDocument(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        ID.unique(),
        {
          ...listingData,
          images: imageUrls,
          ownerId: user.$id,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error creating housing listing:', error);
      throw error;
    }
  }
  
  // Update a housing listing
  async updateHousingListing(listingId, listingData, imageFiles = []) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to update a listing');
      }
      
      const listing = await this.getHousingListing(listingId);
      
      // Check if user is the owner of the listing
      if (listing.ownerId !== user.$id) {
        throw new Error('You can only update your own listings');
      }
      
      let imageUrls = listing.images || [];
      
      // Process and upload new images if provided
      if (imageFiles && imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          // Validate image file
          if (!imageFile || !imageFile.uri) {
            console.error('Invalid image file:', imageFile);
            continue;
          }
          
          const fileId = ID.unique();
          
          // Upload new image
          const uploadedFile = await storage.createFile(
            storageId,
            fileId,
            imageFile
          );
          
          // Get file view URL
          const imageUrl = storage.getFileView(
            storageId,
            uploadedFile.$id
          );
          
          imageUrls.push(imageUrl);
        }
      }
      
      // Update housing document
      return await databases.updateDocument(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        listingId,
        {
          ...listingData,
          images: imageUrls,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error updating housing listing:', error);
      throw error;
    }
  }
  
  // Delete a housing listing
  async deleteHousingListing(listingId) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be logged in to delete a listing');
      }
      
      const listing = await this.getHousingListing(listingId);
      
      // Check if user is the owner of the listing
      if (listing.ownerId !== user.$id) {
        throw new Error('You can only delete your own listings');
      }
      
      // Delete housing document
      return await databases.deleteDocument(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        listingId
      );
    } catch (error) {
      console.error('Error deleting housing listing:', error);
      throw error;
    }
  }
  
  // Search housing listings by location or type
  async searchHousingListings(searchTerm) {
    try {
      const listings = await databases.listDocuments(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        [
          Query.search('title', searchTerm),
          Query.search('location', searchTerm),
          Query.search('type', searchTerm)
        ]
      );
      
      return listings.documents;
    } catch (error) {
      console.error('Error searching housing listings:', error);
      throw error;
    }
  }
  
  // Filter housing listings by price range
  async filterHousingListings(minPrice, maxPrice, bedrooms, type) {
    try {
      let queries = [];
      
      if (minPrice !== undefined && maxPrice !== undefined) {
        queries.push(Query.greaterThanEqual('price', minPrice));
        queries.push(Query.lessThanEqual('price', maxPrice));
      }
      
      if (bedrooms !== undefined) {
        queries.push(Query.equal('bedrooms', bedrooms));
      }
      
      if (type !== undefined) {
        queries.push(Query.equal('type', type));
      }
      
      const listings = await databases.listDocuments(
        DATABASE_ID,
        HOUSING_COLLECTION_ID,
        queries
      );
      
      return listings.documents;
    } catch (error) {
      console.error('Error filtering housing listings:', error);
      throw error;
    }
  }

  async createDocument(collectionId, documentId, data) {
    return await databases.createDocument(
      DATABASE_ID,
      collectionId,
      documentId,
      data
    );
  }
  
  async getMessages(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }
}


export const housingService = new HousingService();


export class ResourcesService {
  // Fetch all resources
  async getAllResources(limit = 20, offset = 0) {
    try {
      const resources = await databases.listDocuments(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        [
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('createdAt')
        ]
      );
      
      return resources.documents;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  // Fetch resources by category
  async getResourcesByCategory(category, limit = 20, offset = 0) {
    try {
      const resources = await databases.listDocuments(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        [
          Query.equal('category', category),
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('createdAt')
        ]
      );
      
      return resources.documents;
    } catch (error) {
      console.error(`Error fetching resources for category ${category}:`, error);
      throw error;
    }
  }

  // Search resources
  async searchResources(query, limit = 20, offset = 0) {
    try {
      // Assuming you have a text index on title and description fields
      const resources = await databases.listDocuments(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        [
          Query.search('title', query),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      
      return resources.documents;
    } catch (error) {
      console.error(`Error searching resources for '${query}':`, error);
      throw error;
    }
  }

  // Get a specific resource by ID
  async getResourceById(resourceId) {
    try {
      const resource = await databases.getDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId
      );
      
      return resource;
    } catch (error) {
      console.error(`Error fetching resource with ID ${resourceId}:`, error);
      throw error;
    }
  }

  // Create a new resource
  async createResource(resourceData, imageFile = null) {
    try {
      // First upload the image if provided
      let imageUrl = null;
      
      if (imageFile && imageFile.uri) {
        console.log('Image file provided, attempting upload');
        try {
          const fileUpload = await this.uploadResourceImage(imageFile);
          if (fileUpload && fileUpload.$id) {
            // Generate the view URL
            imageUrl = storage.getFileView(
              storageId,
              fileUpload.$id
            );
            console.log('Image uploaded successfully, URL:', imageUrl);
          }
        } catch (uploadError) {
          console.error('Error uploading resource image:', uploadError);
          // Continue without the image if upload fails
        }
      }
      
      // Create the resource document
      console.log('Creating resource document with data:', {
        ...resourceData,
        coverImageUrl: imageUrl, // Store the URL directly
        createdAt: new Date().toISOString()
      });
      
      const resource = await databases.createDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        ID.unique(),
        {
          ...resourceData,
          coverImageUrl: imageUrl, // Changed from coverImage to coverImageUrl
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          bookmarks: 0
        }
      );
      
      return resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  // Update an existing resource
  async updateResource(resourceId, resourceData, imageFile = null) {
    try {
      let imageId = resourceData.coverImage;
      
      // Upload new image if provided
      if (imageFile) {
        try {
          const fileUpload = await this.uploadResourceImage(imageFile);
          if (fileUpload && fileUpload.$id) {
            imageId = fileUpload.$id;
          }
        } catch (uploadError) {
          console.error('Error uploading resource image during update:', uploadError);
          // Continue with the existing image if upload fails
        }
      }
      
      // Update the resource document
      const updatedResource = await databases.updateDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId,
        {
          ...resourceData,
          coverImage: imageId,
          updatedAt: new Date().toISOString()
        }
      );
      
      return updatedResource;
    } catch (error) {
      console.error(`Error updating resource with ID ${resourceId}:`, error);
      throw error;
    }
  }

  // Delete a resource
  async deleteResource(resourceId) {
    try {
      // Get the resource first to check if it has an image to delete
      const resource = await this.getResourceById(resourceId);
      
      // Delete the associated image if it exists
      if (resource && resource.coverImage) {
        try {
          await storage.deleteFile(storageId, resource.coverImage);
        } catch (imageError) {
          console.error('Error deleting resource image:', imageError);
          // Continue with deletion even if image deletion fails
        }
      }
      
      // Delete the resource document
      await databases.deleteDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId
      );
      
      return true;
    } catch (error) {
      console.error(`Error deleting resource with ID ${resourceId}:`, error);
      throw error;
    }
  }

  // Upload a resource image
  async uploadResourceImage(file) {
    if (!file || !file.uri) {
      console.error('Invalid file object provided:', file);
      throw new Error('No valid file provided for upload');
    }
    
    try {
      console.log('Preparing to upload file:', file.name);
      
      // Create a unique ID for the file
      const fileId = ID.unique();
      
      // Upload the file to storage - directly pass the file object
      const upload = await storage.createFile(
        storageId,
        fileId,
        file
      );
      
      console.log('File uploaded successfully:', upload.$id);
      return upload;
    } catch (error) {
      console.error('Error uploading resource image:', error);
      console.error('Error details:', JSON.stringify(error));
      throw error;
    }
  }

  // Get the resource image URL from the file ID
  getResourceImageUrl(fileId) {
    if (!fileId) return null;
    
    return storage.getFileView(storageId, fileId);// Changed from storageId to STORAGE_ID
  }

  // Like a resource
  async likeResource(resourceId) {
    try {
      const resource = await this.getResourceById(resourceId);
      
      if (!resource) {
        throw new Error(`Resource with ID ${resourceId} not found`);
      }
      
      const updatedLikes = (resource.likes || 0) + 1;
      
      const updatedResource = await databases.updateDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId,
        {
          likes: updatedLikes
        }
      );
      
      return updatedResource;
    } catch (error) {
      console.error(`Error liking resource ${resourceId}:`, error);
      throw error;
    }
  }

  // Bookmark a resource
  async bookmarkResource(resourceId, userId) {
    try {
      // Get the current resource
      const resource = await this.getResourceById(resourceId);
      
      if (!resource) {
        throw new Error(`Resource with ID ${resourceId} not found`);
      }
      
      // Update bookmarks count
      const updatedBookmarks = (resource.bookmarks || 0) + 1;
      
      // Update the resource with new bookmark count
      const updatedResource = await databases.updateDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId,
        {
          bookmarks: updatedBookmarks
        }
      );
      
      // You might also want to create a separate collection to track user bookmarks
      // This would allow users to view their bookmarked resources
      
      return updatedResource;
    } catch (error) {
      console.error(`Error bookmarking resource ${resourceId}:`, error);
      throw error;
    }
  }
}
// Create and export a singleton instance
export const resourcesService = new ResourcesService();

export class PostService {
  // Create a new post
  async createPost(userId, content, tags, authorName, authorAvatar, authorUniversity, authorProgram) {
    try {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      
      const post = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          authorId: userId,
          content: content,
          tags: tagsArray,
          likes: 0,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          // Store user information with the post
          authorName: authorName,
          authorAvatar: authorAvatar,
          authorUniversity: authorUniversity,
          authorProgram: authorProgram
        }
      );
      
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Get all posts
  async getPosts(limit = 20) {
    try {
      const posts = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );
      
      return posts.documents;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  // The rest of your methods stay the same
  // Get a single post by ID
  async getPost(postId) {
    try {
      const post = await databases.getDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );
      
      return post;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  // Get posts by tag
  async getPostsByTag(tag, limit = 20) {
    try {
      const posts = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.search('tags', tag),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );
      
      return posts.documents;
    } catch (error) {
      console.error('Error getting posts by tag:', error);
      throw error;
    }
  }

  // Get posts by user
  async getPostsByUser(userId, limit = 20) {
    try {
      const posts = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.equal('authorId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );
      
      return posts.documents;
    } catch (error) {
      console.error('Error getting posts by user:', error);
      throw error;
    }
  }

  // Like/unlike a post
  async toggleLikePost(postId, increment = true) {
    try {
      const post = await this.getPost(postId);
      const currentLikes = post.likes || 0;
      
      const updatedPost = await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        {
          likes: increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
        }
      );
      
      return updatedPost;
    } catch (error) {
      console.error('Error updating post likes:', error);
      throw error;
    }
  }

  // Add a comment to a post
  async addComment(postId, userId, content) {
    try {
      // Create the comment
      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId: postId,
          authorId: userId,
          content: content,
          likes: 0,
          createdAt: new Date().toISOString()
        }
      );
      
      // Update the comments count on the post
      const post = await this.getPost(postId);
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        {
          commentsCount: (post.commentsCount || 0) + 1
        }
      );
      
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getComments(postId) {
    try {
      const comments = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [
          Query.equal('postId', postId),
          Query.orderDesc('createdAt')
        ]
      );
      
      return comments.documents;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  // Like/unlike a comment
  async toggleLikeComment(commentId, increment = true) {
    try {
      const comment = await databases.getDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        commentId
      );
      
      const currentLikes = comment.likes || 0;
      
      const updatedComment = await databases.updateDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        commentId,
        {
          likes: increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
        }
      );
      
      return updatedComment;
    } catch (error) {
      console.error('Error updating comment likes:', error);
      throw error;
    }
  }

  // Delete a post
  async deletePost(postId) {
    try {
      // Delete all comments for this post first
      const comments = await this.getComments(postId);
      
      // Delete each comment
      for (const comment of comments) {
        await databases.deleteDocument(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          comment.$id
        );
      }
      
      // Delete the post
      await databases.deleteDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const postService = new PostService();