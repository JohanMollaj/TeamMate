const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');

// Message collection name
const COLLECTION = 'messages';

/**
 * Message Model with CRUD operations
 */
const Message = {
  /**
   * Create a new message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} - Created message with _id
   */
  async create(messageData) {
    const db = getDb();
    
    // Determine message type and set appropriate fields
    let newMessage = {
      sender: new ObjectId(messageData.sender),
      content: messageData.content,
      type: messageData.type || 'direct',
      attachments: messageData.attachments || [],
      readBy: messageData.type === 'direct' ? [new ObjectId(messageData.sender)] : [],
      edited: false,
      createdAt: new Date(),
      updatedAt: null
    };
    
    // Add receiver for direct messages or group for group messages
    if (messageData.type === 'direct' && messageData.receiver) {
      newMessage.receiver = new ObjectId(messageData.receiver);
    } else if (messageData.type === 'group' && messageData.group) {
      newMessage.group = new ObjectId(messageData.group);
    }
    
    const result = await db.collection(COLLECTION).insertOne(newMessage);
    return { _id: result.insertedId, ...newMessage };
  },

  /**
   * Find a message by ID
   * @param {string} id - Message ID
   * @returns {Promise<Object|null>} - Message object or null if not found
   */
  async findById(id) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ 
      _id: new ObjectId(id) 
    });
  },

  /**
   * Get direct messages between two users
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of messages
   */
  async getDirectMessages(user1Id, user2Id, options = {}) {
    const db = getDb();
    const { limit = 50, skip = 0, before } = options;
    
    const user1ObjId = new ObjectId(user1Id);
    const user2ObjId = new ObjectId(user2Id);
    
    let query = {
      type: 'direct',
      $or: [
        { sender: user1ObjId, receiver: user2ObjId },
        { sender: user2ObjId, receiver: user1ObjId }
      ]
    };
    
    // Add time filter if 'before' parameter is provided
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    return await db.collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Get group messages
   * @param {string} groupId - Group ID
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of messages
   */
  async getGroupMessages(groupId, options = {}) {
    const db = getDb();
    const { limit = 50, skip = 0, before } = options;
    
    let query = {
      type: 'group',
      group: new ObjectId(groupId)
    };
    
    // Add time filter if 'before' parameter is provided
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    return await db.collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Update a message's content
   * @param {string} id - Message ID
   * @param {string} content - New content
   * @returns {Promise<Object|null>} - Updated message or null if not found
   */
  async updateContent(id, content) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          content,
          edited: true,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  },

  /**
   * Mark a message as read by a user
   * @param {string} id - Message ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async markAsRead(id, userId) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { 
        $addToSet: { 
          readBy: new ObjectId(userId)
        }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Delete a message by ID
   * @param {string} id - Message ID
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
   * Get the latest message for each conversation (for chat lists)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of the most recent message from each conversation
   */
  async getLatestMessages(userId) {
    const db = getDb();
    const userObjId = new ObjectId(userId);
    
    // Get latest direct messages
    const directPipeline = [
      {
        $match: {
          type: 'direct',
          $or: [
            { sender: userObjId },
            { receiver: userObjId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userObjId] },
              then: "$receiver",
              else: "$sender"
            }
          },
          messageId: { $first: "$_id" },
          content: { $first: "$content" },
          sender: { $first: "$sender" },
          createdAt: { $first: "$createdAt" },
          readBy: { $first: "$readBy" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: "$messageId",
          content: 1,
          sender: 1,
          receiver: "$_id",
          createdAt: 1,
          contactName: "$user.name",
          contactUsername: "$user.username",
          contactImage: "$user.profileImage",
          contactIsOnline: "$user.isOnline",
          unread: {
            $cond: {
              if: { $in: [userObjId, "$readBy"] },
              then: false,
              else: true
            }
          },
          type: { $literal: "direct" }
        }
      }
    ];
    
    // Get latest group messages
    const groupPipeline = [
      {
        $match: {
          type: 'group'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$group",
          messageId: { $first: "$_id" },
          content: { $first: "$content" },
          sender: { $first: "$sender" },
          createdAt: { $first: "$createdAt" },
          readBy: { $first: "$readBy" }
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: '_id',
          as: 'group'
        }
      },
      {
        $unwind: '$group'
      },
      {
        $match: {
          'group.members.userId': userObjId
        }
      },
      {
        $project: {
          _id: "$messageId",
          content: 1,
          sender: 1,
          group: "$_id",
          createdAt: 1,
          groupName: "$group.name",
          groupImage: "$group.groupImage",
          unread: {
            $cond: {
              if: { $in: [userObjId, "$readBy"] },
              then: false,
              else: true
            }
          },
          type: { $literal: "group" }
        }
      }
    ];
    
    const directResults = await db.collection(COLLECTION).aggregate(directPipeline).toArray();
    const groupResults = await db.collection(COLLECTION).aggregate(groupPipeline).toArray();
    
    // Combine and sort by most recent
    return [...directResults, ...groupResults].sort((a, b) => 
      b.createdAt - a.createdAt
    );
  },

  /**
   * Count unread messages
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Counts of unread messages
   */
  async countUnread(userId) {
    const db = getDb();
    const userObjId = new ObjectId(userId);
    
    // Count unread direct messages
    const directCount = await db.collection(COLLECTION).countDocuments({
      type: 'direct',
      receiver: userObjId,
      readBy: { $nin: [userObjId] }
    });
    
    // Count unread group messages (more complex)
    const groupPipeline = [
      {
        $match: {
          type: 'group',
          readBy: { $nin: [userObjId] }
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: 'group',
          foreignField: '_id',
          as: 'groupInfo'
        }
      },
      {
        $unwind: '$groupInfo'
      },
      {
        $match: {
          'groupInfo.members.userId': userObjId
        }
      },
      {
        $count: 'total'
      }
    ];
    
    const groupResult = await db.collection(COLLECTION).aggregate(groupPipeline).toArray();
    const groupCount = groupResult.length > 0 ? groupResult[0].total : 0;
    
    return {
      direct: directCount,
      group: groupCount,
      total: directCount + groupCount
    };
  }
};

module.exports = Message;