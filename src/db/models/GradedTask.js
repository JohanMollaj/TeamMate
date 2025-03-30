const { ObjectId } = require('mongodb');
const { getDb } = require('../connection');

// GradedTask collection name
const COLLECTION = 'gradedTasks';

/**
 * GradedTask Model with CRUD operations
 */
const GradedTask = {
  /**
   * Create a new graded task
   * @param {Object} taskData - Graded task data
   * @returns {Promise<Object>} - Created graded task with _id
   */
  async create(taskData) {
    const db = getDb();
    
    // Add timestamps
    const now = new Date();
    const newGradedTask = {
      taskName: taskData.taskName,
      description: taskData.description || '',
      task: taskData.task ? new ObjectId(taskData.task) : null,
      dateGraded: new Date(taskData.dateGraded || now),
      grade: taskData.grade,
      feedback: taskData.feedback || '',
      group: new ObjectId(taskData.group),
      student: taskData.student ? new ObjectId(taskData.student) : null,
      gradedBy: new ObjectId(taskData.gradedBy),
      submissions: taskData.submissions || [],
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection(COLLECTION).insertOne(newGradedTask);
    return { _id: result.insertedId, ...newGradedTask };
  },

  /**
   * Find a graded task by ID
   * @param {string} id - Graded task ID
   * @returns {Promise<Object|null>} - Graded task object or null if not found
   */
  async findById(id) {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ 
      _id: new ObjectId(id) 
    });
  },

  /**
   * Get all graded tasks with optional filtering and pagination
   * @param {Object} filter - MongoDB filter
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of graded tasks
   */
  async findAll(filter = {}, options = {}) {
    const db = getDb();
    const { sort = { dateGraded: -1 }, limit = 50, skip = 0 } = options;
    
    return await db.collection(COLLECTION)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Get graded tasks for a group
   * @param {string} groupId - Group ID
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of graded tasks
   */
  async getGroupGradedTasks(groupId, options = {}) {
    const db = getDb();
    const { limit = 50, skip = 0 } = options;
    
    return await db.collection(COLLECTION)
      .find({ group: new ObjectId(groupId) })
      .sort({ dateGraded: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Get graded tasks for a student
   * @param {string} studentId - Student ID
   * @param {Object} options - Options for sorting, pagination, etc.
   * @returns {Promise<Array>} - Array of graded tasks
   */
  async getStudentGradedTasks(studentId, options = {}) {
    const db = getDb();
    const { limit = 50, skip = 0 } = options;
    
    return await db.collection(COLLECTION)
      .find({ student: new ObjectId(studentId) })
      .sort({ dateGraded: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Update a graded task by ID
   * @param {string} id - Graded task ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} - Updated graded task or null if not found
   */
  async update(id, updateData) {
    const db = getDb();
    
    // Convert ObjectId fields if present
    if (updateData.group) {
      updateData.group = new ObjectId(updateData.group);
    }
    
    if (updateData.student) {
      updateData.student = new ObjectId(updateData.student);
    }
    
    if (updateData.gradedBy) {
      updateData.gradedBy = new ObjectId(updateData.gradedBy);
    }
    
    // Convert date fields if present
    if (updateData.dateGraded) {
      updateData.dateGraded = new Date(updateData.dateGraded);
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
   * Delete a graded task by ID
   * @param {string} id - Graded task ID
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
   * Add a submission to a graded task
   * @param {string} id - Graded task ID
   * @param {Object} submission - Submission object
   * @returns {Promise<boolean>} - Success status
   */
  async addSubmission(id, submission) {
    const db = getDb();
    
    // Ensure proper structure and convert IDs
    const formattedSubmission = {
      ...submission,
      submittedBy: new ObjectId(submission.submittedBy),
      submittedAt: new Date(submission.submittedAt || new Date())
    };
    
    const result = await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { submissions: formattedSubmission },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  /**
   * Get grade statistics for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<Object>} - Grade statistics
   */
  async getGroupGradeStats(groupId) {
    const db = getDb();
    const groupObjId = new ObjectId(groupId);
    
    const pipeline = [
      {
        $match: { group: groupObjId }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$grade" },
          highest: { $max: "$grade" },
          lowest: { $min: "$grade" },
          count: { $sum: 1 }
        }
      }
    ];
    
    const result = await db.collection(COLLECTION)
      .aggregate(pipeline)
      .toArray();
    
    if (result.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        count: 0
      };
    }
    
    return {
      average: result[0].average,
      highest: result[0].highest,
      lowest: result[0].lowest,
      count: result[0].count
    };
  },

  /**
   * Get grade statistics for a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} - Grade statistics
   */
  async getStudentGradeStats(studentId) {
    const db = getDb();
    const studentObjId = new ObjectId(studentId);
    
    const pipeline = [
      {
        $match: { student: studentObjId }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$grade" },
          highest: { $max: "$grade" },
          lowest: { $min: "$grade" },
          count: { $sum: 1 }
        }
      }
    ];
    
    const result = await db.collection(COLLECTION)
      .aggregate(pipeline)
      .toArray();
    
    if (result.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        count: 0
      };
    }
    
    return {
      average: result[0].average,
      highest: result[0].highest,
      lowest: result[0].lowest,
      count: result[0].count
    };
  }
};

module.exports = GradedTask;