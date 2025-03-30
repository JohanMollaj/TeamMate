const { MongoClient } = require('mongodb');
const config = require('./config');

// Create a singleton connection instance
let client = null;
let db = null;

/**
 * Connect to MongoDB and get database instance
 * @returns {Promise<Object>} MongoDB database instance
 */
async function connectToDatabase() {
  if (db) return db; // Return existing connection if already established
  
  try {
    // Create a new client if one doesn't exist
    if (!client) {
      client = new MongoClient(config.MONGODB_URI, config.OPTIONS);
    }
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    // Get and return database instance
    db = client.db(config.DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  getDb: () => db // Simple getter to access db instance
};