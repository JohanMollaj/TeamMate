const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');
const bcrypt = require('bcrypt');

// User collection name
const COLLECTION = 'users';

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * User Model with CRUD operations
 */
const User = {
  /**
   * Create a new user
   * @param {Object} userData - User data without _id
   * @returns {Promise<Object>} - Created user with _id
   */
  async create(userData) {
    const db = getDb();
    
    // Hash password if provided
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    
    // Add timestamps
    const now = new Date();
    const newUser = {
      ...userData,
      isOnline: false,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(COLLECTION).insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  },

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findById(id) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  },

  /**
   * Find a user by username
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findByUsername(username) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ username });
  },

  /**
   * Find a user by email
   * @param {string} email - Email to search for
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findByEmail(email) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ email });
  },

  /**
   * Get all users with optional filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of users
   */
  async findAll(filter = {}, options = {}) {
    const db = getDb();
    const { sort = { createdAt: -1 }, limit = 50, skip = 0 } = options;
    
    return await db.collection(COLLECTION)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Search for users by name (text search)
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Array of matching users
   */
  async search(query, limit = 20) {
    const db = getDb();
    return await db.collection(COLLECTION)
      .find({ $text: { $search: query } })
      .limit(limit)
      .toArray();
  },

  /**
   * Update a user by ID
   * @param {string} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} - Updated user or null if not found
   */
  async update(id, updateData) {
    const db = getDb();
    
    // Don't allow direct password updates through this method
    if (updateData.password) {
      delete updateData.password;
    }
    
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  },

  /**
   * Update a user's password
   * @param {string} id - User ID
   * @param {string} newPassword - New password (will be hashed)
   * @returns {Promise<boolean>} - Success status
   */
  async updatePassword(id, newPassword) {
    const db = getDb();
    const hashedPassword = await hashPassword(newPassword);
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Update a user's online status
   * @param {string} id - User ID
   * @param {boolean} isOnline - Online status
   * @returns {Promise<boolean>} - Success status
   */
  async updateOnlineStatus(id, isOnline) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isOnline,
          lastActive: new Date(),
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Add a friend to user's friends list (bidirectional)
   * @param {string} userId - User ID
   * @param {string} friendId - Friend's user ID
   * @returns {Promise<boolean>} - Success status
   */
  async addFriend(userId, friendId) {
    const db = getDb();
    
    // Convert string IDs to ObjectId
    const userObjId = new ObjectId(userId);
    const friendObjId = new ObjectId(friendId);
    
    // Add friend to user's friends
    const userResult = await db.collection(COLLECTION).updateOne(
      { _id: userObjId },
      { 
        $addToSet: { friends: friendObjId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Add user to friend's friends
    const friendResult = await db.collection(COLLECTION).updateOne(
      { _id: friendObjId },
      { 
        $addToSet: { friends: userObjId },
        $set: { updatedAt: new Date() }
      }
    );
    
    return userResult.modifiedCount === 1 && friendResult.modifiedCount === 1;
  },

  /**
   * Remove a friend from user's friends list (bidirectional)
   * @param {string} userId - User ID
   * @param {string} friendId - Friend's user ID
   * @returns {Promise<boolean>} - Success status
   */
  async removeFriend(userId, friendId) {
    const db = getDb();
    
    // Convert string IDs to ObjectId
    const userObjId = new ObjectId(userId);
    const friendObjId = new ObjectId(friendId);
    
    // Remove friend from user's friends
    const userResult = await db.collection(COLLECTION).updateOne(
      { _id: userObjId },
      { 
        $pull: { friends: friendObjId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Remove user from friend's friends
    const friendResult = await db.collection(COLLECTION).updateOne(
      { _id: friendObjId },
      { 
        $pull: { friends: userObjId },
        $set: { updatedAt: new Date() }
      }
    );
    
    return userResult.modifiedCount === 1 && friendResult.modifiedCount === 1;
  },

  /**
   * Send a friend request
   * @param {string} fromUserId - User sending the request
   * @param {string} toUserId - User receiving the request
   * @returns {Promise<boolean>} - Success status
   */
  async sendFriendRequest(fromUserId, toUserId) {
    const db = getDb();
    
    const request = {
      from: new ObjectId(fromUserId),
      status: 'pending',
      createdAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(toUserId) },
      { 
        $push: { friendRequests: request },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Delete a user by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async delete(id) {
    const db = getDb();
    const result = await db.collection(COLLECTION).deleteOne({ 
      _id: new ObjectId(id) 
    });
    
    return result.deletedCount === 1;
  },

  /**
   * Get a user's friends
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of friend objects
   */
  async getFriends(userId) {
    const db = getDb();
    
    const user = await this.findById(userId);
    if (!user || !user.friends || user.friends.length === 0) {
      return [];
    }
    
    return await db.collection(COLLECTION)
      .find({ _id: { $in: user.friends } })
      .project({ password: 0 }) // Exclude password
      .toArray();
  },

  /**
   * Verify a user's password
   * @param {string} id - User ID
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(id, password) {
    const user = await this.findById(id);
    if (!user || !user.password) return false;
    return await bcrypt.compare(password, user.password);
  }
};

module.exports = User;