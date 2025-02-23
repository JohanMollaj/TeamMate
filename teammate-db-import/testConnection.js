const { MongoClient } = require('mongodb');

// Replace with your connection string
const uri = "mongodb+srv://orucirael:orucirael@cluster0.kxyhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        
        // List all databases (optional - to verify connection)
        const databasesList = await client.db().admin().listDatabases();
        console.log("Your databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

connectToMongoDB();