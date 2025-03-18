const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose'); // Add this line
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
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
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/messages', require('./routes/messages'));

// Root route
app.get('/', (req, res) => res.send('TeamMate API is running'));
// Socket authentication middleware
io.use((socket, next) => {
try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
    return next(new Error('Authentication error: Token not provided'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
    
    socket.userId = decoded.user.id;
    next();
    });
} catch (error) {
    next(new Error('Authentication error'));
}
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join a room (for direct or group messages)
    socket.on('join', (room) => {
      try {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });
    
    // Handle chat messages
    socket.on('sendMessage', (message) => {
      try {
        io.to(message.roomId).emit('message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      try {
        socket.to(data.roomId).emit('userTyping', data);
      } catch (error) {
        console.error('Error with typing indicator:', error);
      }
    });
  
    // Handle user went online/offline
    socket.on('statusChange', (data) => {
      try {
        io.emit('userStatus', data);
      } catch (error) {
        console.error('Error with status change:', error);
      }
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