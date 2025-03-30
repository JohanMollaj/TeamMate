const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');
const crypto = require('crypto');

// Group collection name
const COLLECTION = 'groups';

/**
 * Generate a random invite code
 * @returns {string} - Random invite code
 */
function generateInviteCode() {
  return crypto.randomBytes(6).toString('hex');
}

/**
 * Group Model with CRUD operations
 */
const Group = {
  /**
   * Create a new group
   * @param {Object} groupData - Group data
   * @returns {Promise<Object>} - Created group with _id
   */
  async create(groupData) {
    const db = getDb();
    
    // Add timestamps
    const now = new Date();
    
    // Ensure creator is the first admin member
    const creatorId = new ObjectId(groupData.createdBy);
    const members = [
      {
        userId: creatorId,
        role: 'admin',
        joinedAt: now
      }
    ];
    
    // Add additional members if provided
    if (groupData.members && Array.isArray(groupData.members)) {
      groupData.members.forEach(memberId => {
        if (memberId !== groupData.createdBy) {
          members.push({
            userId: new ObjectId(memberId),
            role: 'member',
            joinedAt: now
          });
        }
      });
    }
    
    // Generate invite code
    const inviteCode = generateInviteCode();
    
    const newGroup = {
      name: groupData.name,
      description: groupData.description || '',
      groupImage: groupData.groupImage || null,
      createdBy: creatorId,
      members,
      inviteCode,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(COLLECTION).insertOne(newGroup);
    return { _id: result.insertedId, ...newGroup };
  },

  /**
   * Find a group by ID
   * @param {string} id - Group ID
   * @returns {Promise<Object|null>} - Group object or null if not found
   */
  async findById(id) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ 
      _id: new ObjectId(id) 
    });
  },

  /**
   * Find a group by invite code
   * @param {string} inviteCode - Group invite code
   * @returns {Promise<Object|null>} - Group object or null if not found
   */
  async findByInviteCode(inviteCode) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ inviteCode });
  },

  /**
   * Get all groups with optional filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of groups
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
   * Search for groups by name (text search)
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Array of matching groups
   */
  async search(query, limit = 20) {
    const db = getDb();
    return await db.collection(COLLECTION)
      .find({ $text: { $search: query } })
      .limit(limit)
      .toArray();
  },

  /**
   * Update a group by ID
   * @param {string} id - Group ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} - Updated group or null if not found
   */
  async update(id, updateData) {
    const db = getDb();
    
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
   * Add a member to a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to add
   * @param {string} role - Role of the user ('admin', 'moderator', 'member')
   * @returns {Promise<boolean>} - Success status
   */
  async addMember(groupId, userId, role = 'member') {
    const db = getDb();
    
    // Check if user is already a member
    const group = await this.findById(groupId);
    if (!group) return false;
    
    const userObjId = new ObjectId(userId);
    const isAlreadyMember = group.members.some(m => 
      m.userId.toString() === userObjId.toString()
    );
    
    if (isAlreadyMember) return false;
    
    // Add user to group
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(groupId) },
      { 
        $push: { 
          members: {
            userId: userObjId,
            role,
            joinedAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Update a member's role in a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {string} newRole - New role ('admin', 'moderator', 'member')
   * @returns {Promise<boolean>} - Success status
   */
  async updateMemberRole(groupId, userId, newRole) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      { 
        _id: new ObjectId(groupId),
        'members.userId': new ObjectId(userId)
      },
      { 
        $set: { 
          'members.$.role': newRole,
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Remove a member from a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<boolean>} - Success status
   */
  async removeMember(groupId, userId) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(groupId) },
      { 
        $pull: { 
          members: { userId: new ObjectId(userId) } 
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Regenerate a group's invite code
   * @param {string} groupId - Group ID
   * @returns {Promise<string|null>} - New invite code or null on failure
   */
  async regenerateInviteCode(groupId) {
    const db = getDb();
    
    const newInviteCode = generateInviteCode();
    
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(groupId) },
      { 
        $set: { 
          inviteCode: newInviteCode,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result.value ? result.value.inviteCode : null;
  },

  /**
   * Join a group using an invite code
   * @param {string} inviteCode - Group invite code
   * @param {string} userId - User ID joining the group
   * @returns {Promise<Object|null>} - Group object or null if joining failed
   */
  async joinWithInviteCode(inviteCode, userId) {
    const group = await this.findByInviteCode(inviteCode);
    if (!group) return null;
    
    const success = await this.addMember(group._id.toString(), userId);
    return success ? group : null;
  },

  /**
   * Delete a group by ID
   * @param {string} id - Group ID
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
   * Get all groups a user is a member of
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of group objects
   */
  async getUserGroups(userId) {
    const db = getDb();
    
    return await db.collection(COLLECTION)
      .find({ 'members.userId': new ObjectId(userId) })
      .toArray();
  },

  /**
   * Check if a user is a member of a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user is a member
   */
  async isMember(groupId, userId) {
    const group = await this.findById(groupId);
    if (!group) return false;
    
    return group.members.some(m => 
      m.userId.toString() === new ObjectId(userId).toString()
    );
  },

  /**
   * Check if a user has a specific role in a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {Array<string>} roles - Array of role names to check
   * @returns {Promise<boolean>} - True if user has one of the specified roles
   */
  async hasRole(groupId, userId, roles) {
    const group = await this.findById(groupId);
    if (!group) return false;
    
    const member = group.members.find(m => 
      m.userId.toString() === new ObjectId(userId).toString()
    );
    
    if (!member) return false;
    return roles.includes(member.role);
  }
};

module.exports = Group;