const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase } = require('./db/connection');
require('dotenv').config();

// Import routes
const usersRoutes = require('./api/users');
// You would also import other routes as they're created:
const groupsRoutes = require('./api/groups');
const messagesRoutes = require('./api/messages');
const tasksRoutes = require('./api/tasks');
const gradedTasksRoutes = require('./api/gradedTasks');
const friendsRoutes = require('./api/friends');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB before starting the server
(async () => {
  try {
    await connectToDatabase();
    
    // Set up API routes
    app.use('/api/users', usersRoutes);
    // You would also use other routes as they're created:
    app.use('/api/groups', groupsRoutes);
    app.use('/api/messages', messagesRoutes);
    app.use('/api/tasks', tasksRoutes);
    app.use('/api/gradedTasks', gradedTasksRoutes);
    app.use('/api/friends', friendsRoutes);
    
    // Fallback for all other GET requests - serve the React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();

// Handle server shutdown gracefully
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  process.exit(0);
});