// MongoDB configuration settings
require('dotenv').config();

module.exports = {
  // Use environment variables with fallbacks for development
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://orucirael:orucirael@cluster0.kxyhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  
  // Database name
  DB_NAME: process.env.DB_NAME || 'TeamMate',
  
  // Connection options
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // For production, enable additional options as needed:
    // retryWrites: true,
    // w: 'majority',
    // maxPoolSize: 10
  }
};