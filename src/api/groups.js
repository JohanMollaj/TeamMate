const express = require('express');
const router = express.Router();
const Group = require('../db/models/Group');
const { ObjectId } = require('mongodb');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, search = '' } = req.query;
    
    let filter = {};
    if (search) {
      filter = { $text: { $search: search } };
    }
    
    const groups = await Group.findAll(filter, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    
    res.json(groups);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, members, createdBy } = req.body;
    
    if (!name || !createdBy) {
      return res.status(400).json({ 
        message: 'Missing required fields (name, createdBy)' 
      });
    }
    
    const newGroup = await Group.create({
      name,
      description: description || '',
      createdBy,
      members: members || [createdBy]
    });
    
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a group
router.put('/:id', async (req, res) => {
  try {
    const { name, description, groupImage } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (groupImage !== undefined) updateData.groupImage = groupImage;
    
    const updatedGroup = await Group.update(req.params.id, updateData);
    
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a member to a group
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const success = await Group.addMember(
      req.params.id,
      userId,
      role || 'member'
    );
    
    if (!success) {
      return res.status(404).json({ 
        message: 'Group not found or user is already a member' 
      });
    }
    
    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Error adding group member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a member from a group
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const success = await Group.removeMember(req.params.id, req.params.userId);
    
    if (!success) {
      return res.status(404).json({ message: 'Group or member not found' });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join group with invite code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    
    if (!inviteCode || !userId) {
      return res.status(400).json({ 
        message: 'Missing required fields (inviteCode, userId)' 
      });
    }
    
    const group = await Group.joinWithInviteCode(inviteCode, userId);
    
    if (!group) {
      return res.status(404).json({ 
        message: 'Invalid invite code or error joining group' 
      });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a group
router.delete('/:id', async (req, res) => {
  try {
    const success = await Group.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get groups for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await Group.getUserGroups(req.params.userId);
    res.json(groups);
  } catch (error) {
    console.error('Error getting user groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;