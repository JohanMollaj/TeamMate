const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

// @route   GET api/tasks
// @desc    Get all tasks for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user.id 
    })
      .populate('assignedBy', 'name username')
      .populate('assignedTo', 'name username')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  const { 
    title, 
    description, 
    dueDate, 
    assignedTo, 
    groupId 
  } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      dueDate,
      assignedBy: req.user.id,
      assignedTo: assignedTo || [],
      groupId: groupId || null
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { 
    title, 
    description, 
    dueDate, 
    assignedTo, 
    completed,
    completedAt,
    grade
  } = req.body;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user is authorized (assignedBy or assignedTo)
    const isAssignedBy = task.assignedBy.toString() === req.user.id;
    const isAssignedTo = task.assignedTo.some(userId => 
      userId.toString() === req.user.id
    );

    if (!isAssignedBy && !isAssignedTo) {
      return res.status(401).json({ msg: 'Not authorized to modify this task' });
    }

    // Update fields if they're provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo && isAssignedBy) task.assignedTo = assignedTo;
    
    // Only assignedTo users can mark as complete
    if (completed !== undefined && isAssignedTo) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
    }
    
    // Only assignedBy users can grade
    if (grade && isAssignedBy) {
      task.grade = {
        ...grade,
        gradedBy: req.user.id,
        dateGraded: new Date()
      };
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Additional routes for submitting, commenting, etc.
// ...

module.exports = router;