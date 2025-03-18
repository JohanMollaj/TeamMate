const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

// @route   GET api/messages/direct/:userId
// @desc    Get direct messages between current user and another user
// @access  Private
router.get('/direct/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      type: 'direct',
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name username profileImage')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/group/:groupId
// @desc    Get messages for a specific group
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    // First check if user is in the group
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'Not authorized to view this group\'s messages' });
    }
    
    // Get group messages
    const messages = await Message.find({
      type: 'group',
      group: req.params.groupId
    })
      .populate('sender', 'name username profileImage')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/messages/direct
// @desc    Send a direct message to another user
// @access  Private
router.post('/direct', auth, async (req, res) => {
  const { receiver, message } = req.body;
  
  try {
    const newMessage = new Message({
      sender: req.user.id,
      receiver,
      type: 'direct',
      message
    });
    
    await newMessage.save();
    
    // Populate sender info before sending response
    await newMessage.populate('sender', 'name username profileImage');
    
    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/messages/group
// @desc    Send a message to a group
// @access  Private
router.post('/group', auth, async (req, res) => {
  const { group, message } = req.body;
  
  try {
    // Check if user is in the group
    const groupData = await Group.findById(group);
    
    if (!groupData) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    const isMember = groupData.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'Not authorized to send messages to this group' });
    }
    
    const newMessage = new Message({
      sender: req.user.id,
      group,
      type: 'group',
      message
    });
    
    await newMessage.save();
    
    // Populate sender info before sending response
    await newMessage.populate('sender', 'name username profileImage');
    
    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { message } = req.body;
  
  try {
    let msg = await Message.findById(req.params.id);
    
    if (!msg) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Only the sender can edit their message
    if (msg.sender.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to edit this message' });
    }
    
    msg.message = message;
    msg.edited = true;
    
    await msg.save();
    
    res.json(msg);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;