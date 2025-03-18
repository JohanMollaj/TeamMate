const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
require('dotenv').config();

const { check, validationResult } = require('express-validator');

// Then update the register route:
router.post(
  '/register', 
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Rest of the registration code...
  }
);

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    // Check if user exists
    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ msg: 'Email already in use' });
    }
    
    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    // Create new user
    user = new User({
      name,
      email,
      username,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;

  // if (!email || !password) {
  //   return res.status(400).json({ msg: 'Please provide email and password' });
  // } 

  // try {
  //   // Check for user
  //   const user = await User.findOne({ email });
  //   if (!user) {
  //     return res.status(400).json({ msg: 'Invalid credentials' });
  //   }

  //   // Check password
  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) {
  //     return res.status(400).json({ msg: 'Invalid credentials' });
  //   }

  //   // Update online status
  //   user.isOnline = true;
  //   await user.save();

  //   // Create payload
  //   const payload = {
  //     user: {
  //       id: user.id
  //     }
  //   };
  try {
    // Create and return a token without password validation
    const payload = { user: { id: '12345' } };
    
    console.log('User ID from token:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/logout
// @desc    Logout user & update online status
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update online status
    const user = await User.findById(req.user.id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;