const express = require('express');
const router = express.Router();
const Friend = require('../db/models/Friend');
const User = require('../db/models/User');
const { ObjectId } = require('mongodb');

// Get all friends for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const friendships = await Friend.getUserFriends(userId);
    
    // Transform to include user information
    const friendsWithDetails = await Promise.all(friendships.map(async (friendship) => {
      const friendId = friendship.user1Id.toString() === userId ? 
        friendship.user2Id : friendship.user1Id;
      
      const friendUser = await User.findById(friendId.toString());
      
      if (!friendUser) {
        return null;
      }
      
      const { password, ...safeUser } = friendUser;
      
      return {
        friendship,
        user: safeUser
      };
    }));
    
    // Filter out nulls (in case a user was deleted)
    const validFriends = friendsWithDetails.filter(item => item !== null);
    
    res.json(validFriends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend requests for a user
router.get('/requests/:userId', async (req, res) => {
  try {
    const requests = await Friend.getFriendRequests(req.params.userId);
    
    // Transform to include user information
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      const requesterId = request.initiatedBy;
      const requester = await User.findById(requesterId.toString());
      
      if (!requester) {
        return null;
      }
      
      const { password, ...safeUser } = requester;
      
      return {
        request,
        user: safeUser
      };
    }));
    
    // Filter out nulls
    const validRequests = requestsWithDetails.filter(item => item !== null);
    
    res.json(validRequests);
  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a friend request
router.post('/', async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    
    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await Friend.getFriendship(fromUserId, toUserId);
    
    if (existingFriendship) {
      return res.status(400).json({ 
        message: 'Friendship already exists', 
        status: existingFriendship.status 
      });
    }
    
    // Create the friendship request
    const friendship = await Friend.create(fromUserId, toUserId, fromUserId);
    
    res.status(201).json(friendship);
  } catch (error) {
    console.error('Error creating friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a friend request
router.put('/:friendshipId/accept', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get the friendship
    const db = require('../db/connection').getDb();
    const friendship = await db.collection('friends').findOne({ 
      _id: new ObjectId(req.params.friendshipId)
    });
    
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }
    
    // Verify the accepting user is part of the friendship
    const isUser1 = friendship.user1Id.toString() === userId;
    const isUser2 = friendship.user2Id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return res.status(403).json({ message: 'User not authorized to accept this request' });
    }
    
    // Verify the user is not the initiator
    if (friendship.initiatedBy.toString() === userId) {
      return res.status(400).json({ message: 'Cannot accept a request you initiated' });
    }
    
    // Update status to accepted
    const success = await Friend.updateStatus(
      friendship.user1Id.toString(), 
      friendship.user2Id.toString(), 
      'accepted'
    );
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to accept friend request' });
    }
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline a friend request
router.put('/:friendshipId/decline', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get the friendship
    const db = require('../db/connection').getDb();
    const friendship = await db.collection('friends').findOne({ 
      _id: new ObjectId(req.params.friendshipId)
    });
    
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }
    
    // Verify the declining user is part of the friendship
    const isUser1 = friendship.user1Id.toString() === userId;
    const isUser2 = friendship.user2Id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return res.status(403).json({ message: 'User not authorized to decline this request' });
    }
    
    // Verify the user is not the initiator
    if (friendship.initiatedBy.toString() === userId) {
      return res.status(400).json({ message: 'Cannot decline a request you initiated' });
    }
    
    // Update status to declined
    const success = await Friend.updateStatus(
      friendship.user1Id.toString(), 
      friendship.user2Id.toString(), 
      'declined'
    );
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to decline friend request' });
    }
    
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a friendship
router.delete('/:friendshipId', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get the friendship
    const db = require('../db/connection').getDb();
    const friendship = await db.collection('friends').findOne({ 
      _id: new ObjectId(req.params.friendshipId)
    });
    
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }
    
    // Verify the user is part of the friendship
    const isUser1 = friendship.user1Id.toString() === userId;
    const isUser2 = friendship.user2Id.toString() === userId;
    
    if (!isUser1 && !isUser2) {
      return res.status(403).json({ message: 'User not authorized to remove this friendship' });
    }
    
    // Delete the friendship
    const success = await Friend.delete(
      friendship.user1Id.toString(), 
      friendship.user2Id.toString()
    );
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to remove friendship' });
    }
    
    res.json({ message: 'Friendship removed' });
  } catch (error) {
    console.error('Error removing friendship:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;