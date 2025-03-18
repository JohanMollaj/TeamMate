const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

// Initialize Express
const app = express();

// Create HTTP server with Express
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/messages', require('./routes/messages'));

// Root route
app.get('/', (req, res) => res.send('TeamMate API is running'));

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a room (for direct or group messages)
  socket.on('join', (room) => {
    socket.join(room);
  });
  
  // Handle chat messages
  socket.on('sendMessage', (message) => {
    io.to(message.roomId).emit('message', message);
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('userTyping', data);
  });

  // Handle user went online/offline
  socket.on('statusChange', (data) => {
    io.emit('userStatus', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Test MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));