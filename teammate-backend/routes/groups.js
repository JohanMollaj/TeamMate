const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');

// @route   GET api/groups
// @desc    Get all groups for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id
    }).populate('members.user', 'name username profileImage');
    
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/groups/:id
// @desc    Get a specific group
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name username profileImage isOnline')
      .populate('createdBy', 'name username');
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if the user is a member of the group
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(401).json({ msg: 'Not authorized to view this group' });
    }
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/groups
// @desc    Create a new group
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;

  try {
    const newGroup = new Group({
      name,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    const group = await newGroup.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/groups/join/:inviteCode
// @desc    Join a group using invite code
// @access  Private
router.post('/join/:inviteCode', auth, async (req, res) => {
  try {
    const group = await Group.findOne({ inviteCode: req.params.inviteCode });
    
    if (!group) {
      return res.status(404).json({ msg: 'Invalid invite code' });
    }
    
    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (isMember) {
      return res.status(400).json({ msg: 'You are already a member of this group' });
    }
    
    // Add user to the group
    group.members.push({ user: req.user.id, role: 'member' });
    
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/groups/:id
// @desc    Update a group
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description, groupImage } = req.body;

  try {
    let group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is an admin of the group
    const adminMember = group.members.find(member => 
      member.user.toString() === req.user.id && member.role === 'admin'
    );
    
    if (!adminMember) {
      return res.status(401).json({ msg: 'Not authorized to update this group' });
    }
    
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (groupImage) group.groupImage = groupImage;
    
    await group.save();
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;