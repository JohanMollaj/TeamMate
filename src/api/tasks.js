const express = require('express');
const router = express.Router();
const Task = require('../db/models/Task');
const { ObjectId } = require('mongodb');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { completed, limit = 50, skip = 0, dueBefore, dueAfter } = req.query;
    
    // Build filter
    let filter = {};
    
    // Add completion filter if specified
    if (completed !== undefined) {
      filter.completed = completed === 'true';
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
    
    const tasks = await Task.findAll(filter, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      sort: { dueDate: 1 } // Sort by due date ascending
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { completed } = req.query;
    
    const options = {};
    if (completed !== undefined) {
      options.completed = completed === 'true';
    }
    
    const tasks = await Task.getUserTasks(req.params.userId, options);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting user tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, assignedBy, assignedTo, group } = req.body;
    
    // Validate required fields
    if (!title || !dueDate || !assignedBy) {
      return res.status(400).json({ 
        message: 'Missing required fields (title, dueDate, assignedBy)' 
      });
    }
    
    // Create new task
    const newTask = await Task.create({
      title,
      description: description || '',
      dueDate,
      assignedBy,
      assignedTo,
      group,
      priority: req.body.priority || 'medium'
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, priority } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    
    const updatedTask = await Task.update(req.params.id, updateData);
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a task as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const completedTask = await Task.markAsCompleted(req.params.id);
    
    if (!completedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(completedTask);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a task as incomplete
router.put('/:id/incomplete', async (req, res) => {
  try {
    const incompletedTask = await Task.markAsIncomplete(req.params.id);
    
    if (!incompletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(incompletedTask);
  } catch (error) {
    console.error('Error marking task as incomplete:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const success = await Task.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await Task.getTaskStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;