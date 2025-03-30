const express = require('express');
const router = express.Router();
const Message = require('../db/models/Message');
const { ObjectId } = require('mongodb');

// Get direct messages between two users
router.get('/direct/:userId', async (req, res) => {
  try {
    const currentUserId = "1"; // In a real app, this would come from auth middleware
    const otherUserId = req.params.userId;
    
    const messages = await Message.getDirectMessages(currentUserId, otherUserId, {
      limit: 50, // Adjust as needed
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting direct messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages
router.get('/group/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    const messages = await Message.getGroupMessages(groupId, {
      limit: 50, // Adjust as needed
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting group messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, group, content, type } = req.body;
    
    // Validate required fields
    if (!sender || !content || !type) {
      return res.status(400).json({ 
        message: 'Missing required fields (sender, content, type)' 
      });
    }
    
    // Validate message type
    if (type === 'direct' && !receiver) {
      return res.status(400).json({ message: 'Direct messages require a receiver' });
    }
    
    if (type === 'group' && !group) {
      return res.status(400).json({ message: 'Group messages require a group' });
    }
    
    // Create the message
    const newMessage = await Message.create({
      sender,
      receiver,
      group,
      content,
      type
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a message
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const updatedMessage = await Message.updateContent(req.params.id, content);
    
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const success = await Message.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get the latest messages for each conversation
router.get('/latest', async (req, res) => {
  try {
    const userId = "1"; // In a real app, this would come from auth middleware
    const latestMessages = await Message.getLatestMessages(userId);
    
    res.json(latestMessages);
  } catch (error) {
    console.error('Error getting latest messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;