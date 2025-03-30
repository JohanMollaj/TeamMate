const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');

// Friends collection name
const COLLECTION = 'friends';

/**
 * Friend Model with CRUD operations
 */
const Friend = {
  /**
   * Create a new friendship (as pending)
   * @param {string} user1Id - First user's ID
   * @param {string} user2Id - Second user's ID
   * @param {string} initiatedBy - ID of user who initiated the request
   * @returns {Promise<Object>} - Created friendship
   */
  async create(user1Id, user2Id, initiatedBy) {
    const db = getDb();
    
    // Always store users in a consistent order to prevent duplicates
    const [smallerId, largerId] = [user1Id, user2Id].sort();
    
    const now = new Date();
    const friendship = {
      user1Id: new ObjectId(smallerId),
      user2Id: new ObjectId(largerId),
      status: 'pending',
      initiatedBy: new ObjectId(initiatedBy),
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(COLLECTION).insertOne(friendship);
    return { _id: result.insertedId, ...friendship };
  },
  
  /**
   * Get friendship status between two users
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @returns {Promise<Object|null>} - Friendship object or null if not found
   */
  async getFriendship(user1Id, user2Id) {
    const db = getDb();
    
    // Handle IDs in either order
    const friendship = await db.collection(COLLECTION).findOne({
      $or: [
        { user1Id: new ObjectId(user1Id), user2Id: new ObjectId(user2Id) },
        { user1Id: new ObjectId(user2Id), user2Id: new ObjectId(user1Id) }
      ]
    });
    
    return friendship;
  },
  
  /**
   * Update friendship status
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @param {string} status - New status ('accepted', 'declined', 'blocked')
   * @returns {Promise<boolean>} - Success status
   */
  async updateStatus(user1Id, user2Id, status) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      {
        $or: [
          { user1Id: new ObjectId(user1Id), user2Id: new ObjectId(user2Id) },
          { user1Id: new ObjectId(user2Id), user2Id: new ObjectId(user1Id) }
        ]
      },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount === 1;
  },
  
  /**
   * Get all friends for a user
   * @param {string} userId - User ID
   * @param {Object} options - Options like limit, status filter
   * @returns {Promise<Array>} - Array of friend relationships
   */
  async getUserFriends(userId, options = {}) {
    const db = getDb();
    const { status = 'accepted', limit = 50, skip = 0 } = options;
    
    const userObjectId = new ObjectId(userId);
    
    // Find all friendships where this user is either user1 or user2
    const friendships = await db.collection(COLLECTION)
      .find({
        $and: [
          { status },
          { $or: [{ user1Id: userObjectId }, { user2Id: userObjectId }] }
        ]
      })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return friendships;
  },
  
  /**
   * Get friend requests for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of pending friend requests
   */
  async getFriendRequests(userId) {
    const db = getDb();
    
    const userObjectId = new ObjectId(userId);
    
    // Find all pending friendships where this user is NOT the initiator
    const requests = await db.collection(COLLECTION)
      .find({
        $and: [
          { status: 'pending' },
          { $or: [{ user1Id: userObjectId }, { user2Id: userObjectId }] },
          { initiatedBy: { $ne: userObjectId } }
        ]
      })
      .toArray();
    
    return requests;
  },
  
  /**
   * Delete a friendship
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @returns {Promise<boolean>} - Success status
   */
  async delete(user1Id, user2Id) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).deleteOne({
      $or: [
        { user1Id: new ObjectId(user1Id), user2Id: new ObjectId(user2Id) },
        { user1Id: new ObjectId(user2Id), user2Id: new ObjectId(user1Id) }
      ]
    });
    
    return result.deletedCount === 1;
  }
};

module.exports = Friend;