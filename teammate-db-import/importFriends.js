// Required dependencies
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

// MongoDB Atlas connection string (replace with your actual connection string)
const uri = "mongodb+srv://orucirael:orucirael@cluster0.kxyhv.mongodb.net/TeamMate?retryWrites=true&w=majority";

// Function to import friends data to MongoDB
async function importFriendsToMongoDB() {
    let client;
    
    try {
        // Connect to MongoDB
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        // Get database and collection
        const database = client.db('TeamMate');
        const collection = database.collection('Friends');

        // Read and parse the friends.json file
        const rawData = await fs.readFile('public/friends.json', 'utf8');
        const friends = JSON.parse(rawData);

        // Insert the documents
        const result = await collection.insertMany(friends);
        console.log(`${result.insertedCount} documents were inserted`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

// Run the import function
importFriendsToMongoDB();