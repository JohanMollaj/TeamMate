const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');

// Task collection name
const COLLECTION = 'tasks';

/**
 * Task Model with CRUD operations
 */
const Task = {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} - Created task with _id
   */
  async create(taskData) {
    const db = getDb();
    
    // Add timestamps and defaults
    const now = new Date();
    const newTask = {
      title: taskData.title,
      description: taskData.description || '',
      dueDate: new Date(taskData.dueDate),
      assignedBy: new ObjectId(taskData.assignedBy),
      assignedTo: taskData.assignedTo ? new ObjectId(taskData.assignedTo) : null,
      group: taskData.group ? new ObjectId(taskData.group) : null,
      completed: false,
      completedAt: null,
      priority: taskData.priority || 'medium',
      attachments: taskData.attachments || [],
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(COLLECTION).insertOne(newTask);
    return { _id: result.insertedId, ...newTask };
  },

  /**
   * Find a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<Object|null>} - Task object or null if not found
   */
  async findById(id) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ 
      _id: new ObjectId(id) 
    });
  },

  /**
   * Get all tasks with optional filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of tasks
   */
  async findAll(filter = {}, options = {}) {
    const db = getDb();
    const { sort = { dueDate: 1 }, limit = 50, skip = 0 } = options;
    
    return await db.collection(COLLECTION)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Get tasks assigned to a user
   * @param {string} userId - User ID
   * @param {Object} options - Filter options like 'completed', etc.
   * @returns {Promise<Array>} - Array of tasks
   */
  async getUserTasks(userId, options = {}) {
    const db = getDb();
    const { completed, limit = 50, skip = 0, dueBefore, dueAfter } = options;
    
    // Build filter
    let filter = {
      assignedTo: new ObjectId(userId)
    };
    
    // Add completion filter if specified
    if (completed !== undefined) {
      filter.completed = completed;
    }
    
    // Add due date filters if specified
    if (dueBefore || dueAfter) {
      filter.dueDate = {};
      
      if (dueBefore) {
        filter.dueDate.$lte = new Date(dueBefore);
      }
      
      if (dueAfter) {
        filter.dueDate.$gte = new Date(dueAfter);
      }
    }
    
    return await db.collection(COLLECTION)
      .find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Get tasks for a group
   * @param {string} groupId - Group ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Array of tasks
   */
  async getGroupTasks(groupId, options = {}) {
    const db = getDb();
    const { completed, limit = 50, skip = 0 } = options;
    
    // Build filter
    let filter = {
      group: new ObjectId(groupId)
    };
    
    // Add completion filter if specified
    if (completed !== undefined) {
      filter.completed = completed;
    }
    
    return await db.collection(COLLECTION)
      .find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Update a task by ID
   * @param {string} id - Task ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} - Updated task or null if not found
   */
  async update(id, updateData) {
    const db = getDb();
    
    // Convert ObjectId fields if present
    if (updateData.assignedTo) {
      updateData.assignedTo = new ObjectId(updateData.assignedTo);
    }
    
    if (updateData.group) {
      updateData.group = new ObjectId(updateData.group);
    }
    
    // Convert dueDate to Date object if present
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
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
   * Mark a task as completed
   * @param {string} id - Task ID
   * @returns {Promise<Object|null>} - Updated task or null if not found
   */
  async markAsCompleted(id) {
    const db = getDb();
    
    const now = new Date();
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          completed: true,
          completedAt: now,
          updatedAt: now
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  },

  /**
   * Mark a task as incomplete
   * @param {string} id - Task ID
   * @returns {Promise<Object|null>} - Updated task or null if not found
   */
  async markAsIncomplete(id) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          completed: false,
          completedAt: null,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  },

  /**
   * Add an attachment to a task
   * @param {string} id - Task ID
   * @param {Object} attachment - Attachment object
   * @returns {Promise<boolean>} - Success status
   */
  async addAttachment(id, attachment) {
    const db = getDb();
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { attachments: attachment },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Delete a task by ID
   * @param {string} id - Task ID
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
   * Get task statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Task statistics
   */
  async getTaskStats(userId) {
    const db = getDb();
    const userObjId = new ObjectId(userId);
    
    // Get total tasks count
    const totalTasks = await db.collection(COLLECTION).countDocuments({
      assignedTo: userObjId
    });
    
    // Get completed tasks count
    const completedTasks = await db.collection(COLLECTION).countDocuments({
      assignedTo: userObjId,
      completed: true
    });
    
    // Get overdue tasks count
    const now = new Date();
    const overdueTasks = await db.collection(COLLECTION).countDocuments({
      assignedTo: userObjId,
      completed: false,
      dueDate: { $lt: now }
    });
    
    // Get tasks due soon (within 3 days)
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const dueSoonTasks = await db.collection(COLLECTION).countDocuments({
      assignedTo: userObjId,
      completed: false,
      dueDate: { 
        $gte: now,
        $lte: threeDaysFromNow
      }
    });
    
    return {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      dueSoon: dueSoonTasks,
      completion: totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0
    };
  }
};

module.exports = Task;