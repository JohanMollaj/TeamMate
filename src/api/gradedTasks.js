const express = require('express');
const router = express.Router();
const GradedTask = require('../db/models/GradedTask');
const { ObjectId } = require('mongodb');

// Get all graded tasks
router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const gradedTasks = await GradedTask.findAll({}, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { dateGraded: -1 } // Most recent first
    });
    
    res.json(gradedTasks);
  } catch (error) {
    console.error('Error getting graded tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a graded task by ID
router.get('/:id', async (req, res) => {
  try {
    const gradedTask = await GradedTask.findById(req.params.id);
    
    if (!gradedTask) {
      return res.status(404).json({ message: 'Graded task not found' });
    }
    
    res.json(gradedTask);
  } catch (error) {
    console.error('Error getting graded task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get graded tasks for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const gradedTasks = await GradedTask.getGroupGradedTasks(req.params.groupId);
    res.json(gradedTasks);
  } catch (error) {
    console.error('Error getting group graded tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get graded tasks for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const gradedTasks = await GradedTask.getStudentGradedTasks(req.params.studentId);
    res.json(gradedTasks);
  } catch (error) {
    console.error('Error getting student graded tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new graded task
router.post('/', async (req, res) => {
  try {
    const { 
      taskName, description, dateGraded, grade, feedback, 
      group, student, gradedBy, task 
    } = req.body;
    
    // Validate required fields
    if (!taskName || !dateGraded || grade === undefined || !group || !gradedBy) {
      return res.status(400).json({ 
        message: 'Missing required fields (taskName, dateGraded, grade, group, gradedBy)' 
      });
    }
    
    // Validate grade range
    if (grade < 0 || grade > 10) {
      return res.status(400).json({ message: 'Grade must be between 0 and 10' });
    }
    
    // Create new graded task
    const newGradedTask = await GradedTask.create({
      taskName,
      description: description || '',
      dateGraded,
      grade,
      feedback: feedback || '',
      group,
      student,
      gradedBy,
      task
    });
    
    res.status(201).json(newGradedTask);
  } catch (error) {
    console.error('Error creating graded task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a graded task
router.put('/:id', async (req, res) => {
  try {
    const { taskName, description, grade, feedback } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (taskName) updateData.taskName = taskName;
    if (description !== undefined) updateData.description = description;
    if (grade !== undefined) updateData.grade = grade;
    if (feedback !== undefined) updateData.feedback = feedback;
    
    // Validate grade range if provided
    if (grade !== undefined && (grade < 0 || grade > 10)) {
      return res.status(400).json({ message: 'Grade must be between 0 and 10' });
    }
    
    const updatedGradedTask = await GradedTask.update(req.params.id, updateData);
    
    if (!updatedGradedTask) {
      return res.status(404).json({ message: 'Graded task not found' });
    }
    
    res.json(updatedGradedTask);
  } catch (error) {
    console.error('Error updating graded task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a submission to a graded task
router.post('/:id/submissions', async (req, res) => {
  try {
    const { url, name, submittedBy } = req.body;
    
    if (!url || !submittedBy) {
      return res.status(400).json({ 
        message: 'Missing required fields (url, submittedBy)' 
      });
    }
    
    const submission = {
      url,
      name: name || 'submission',
      submittedBy,
      submittedAt: new Date()
    };
    
    const success = await GradedTask.addSubmission(req.params.id, submission);
    
    if (!success) {
      return res.status(404).json({ message: 'Graded task not found' });
    }
    
    res.status(201).json({ message: 'Submission added successfully' });
  } catch (error) {
    console.error('Error adding submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a graded task
router.delete('/:id', async (req, res) => {
  try {
    const success = await GradedTask.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Graded task not found' });
    }
    
    res.json({ message: 'Graded task deleted successfully' });
  } catch (error) {
    console.error('Error deleting graded task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grade statistics for a group
router.get('/stats/group/:groupId', async (req, res) => {
  try {
    const stats = await GradedTask.getGroupGradeStats(req.params.groupId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting group grade stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;