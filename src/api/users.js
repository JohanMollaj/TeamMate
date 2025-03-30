const express = require('express');
const router = express.Router();
const User = require('../db/models/User');

// Get all users (with pagination)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, search = '', isOnline } = req.query;
    
    let filter = {};
    
    if (search) {
      // Use the text index if a search term is provided
      filter = { $text: { $search: search } };
    }
    
    if (isOnline !== undefined) {
      filter.isOnline = isOnline === 'true';
    }
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip)
    };
    
    const users = await User.findAll(filter, options);
    
    // Don't send password hashes to the client
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password hash to the client
    const { password, ...safeUser } = user;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, name, password } = req.body;
    
    // Basic validation
    if (!username || !email || !name || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields (username, email, name, password)' 
      });
    }
    
    // Check if username or email already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      name,
      password, // Will be hashed in User model
      profileImage: null,
      bio: '',
      friends: []
    });
    
    // Don't send password hash back to client
    const { password: pw, ...safeUser } = newUser;
    
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    
    // Only allow updating certain fields
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    const updatedUser = await User.update(req.params.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password hash back to client
    const { password, ...safeUser } = updatedUser;
    
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user online status
router.put('/:id/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (isOnline === undefined) {
      return res.status(400).json({ message: 'isOnline status required' });
    }
    
    const success = await User.updateOnlineStatus(req.params.id, isOnline);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a user's friends
router.get('/:id/friends', async (req, res) => {
  try {
    const friends = await User.getFriends(req.params.id);
    
    // Remove sensitive information from friends
    const safeFriends = friends.map(friend => {
      const { password, ...safeFriend } = friend;
      return safeFriend;
    });
    
    res.json(safeFriends);
  } catch (error) {
    console.error('Error getting user friends:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a friend request
router.post('/:id/friend-requests', async (req, res) => {
  try {
    const { toUserId } = req.body;
    
    if (!toUserId) {
      return res.status(400).json({ message: 'toUserId required' });
    }
    
    const success = await User.sendFriendRequest(req.params.id, toUserId);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a friend request
router.put('/:id/friend-requests/:requestId/accept', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the friend request
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === req.params.requestId
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    const request = user.friendRequests[requestIndex];
    
    // Add both users as friends
    const success = await User.addFriend(req.params.id, request.from.toString());
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to add friend' });
    }
    
    // Update request status
    user.friendRequests[requestIndex].status = 'accepted';
    await User.update(req.params.id, { friendRequests: user.friendRequests });
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a friend request
router.put('/:id/friend-requests/:requestId/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the friend request
    const requestIndex = user.friendRequests.findIndex(
      req => req._id.toString() === req.params.requestId
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    // Update request status
    user.friendRequests[requestIndex].status = 'rejected';
    await User.update(req.params.id, { friendRequests: user.friendRequests });
    
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete (unfriend) a friend
router.delete('/:id/friends/:friendId', async (req, res) => {
  try {
    const success = await User.removeFriend(req.params.id, req.params.friendId);
    
    if (!success) {
      return res.status(404).json({ message: 'User or friend not found' });
    }
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password required' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await User.verifyPassword(req.params.id, currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    const success = await User.updatePassword(req.params.id, newPassword);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const success = await User.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;