const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection string
const uri = "mongodb+srv://orucirael:orucirael@cluster0.kxyhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function importDataToMongoDB() {
    let client;
    
    try {
        // Update the path to point to your main TeamMate folder's public directory
        const mainTeamMatePublicPath = path.join(__dirname, '..', '..', 'TeamMate', 'public');
        
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const database = client.db('TeamMate');
        
        // Create collections with indexes
        const friendsCollection = database.collection('Friends');
        await friendsCollection.createIndex({ "id": 1 }, { unique: true });
        
        const groupsCollection = database.collection('Groups');
        await groupsCollection.createIndex({ "id": 1 }, { unique: true });

        const messagesCollection = database.collection('Messages');
        // Create compound index for messages to ensure unique combinations of sender, receiver, and time
        await messagesCollection.createIndex({ 
            "senderID": 1, 
            "receiverID": 1, 
            "time": 1 
        }, { unique: true });

        // Import friends
        const friendsPath = path.join(mainTeamMatePublicPath, 'friends.json');
        console.log('Reading friends from:', friendsPath);
        const friendsData = JSON.parse(await fs.readFile(friendsPath, 'utf8'));
        
        for (const friend of friendsData) {
            try {
                await friendsCollection.updateOne(
                    { id: friend.id },
                    { $set: friend },
                    { upsert: true }
                );
                console.log(`Friend with ID ${friend.id} processed successfully`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Duplicate friend ID ${friend.id} skipped`);
                } else {
                    console.error(`Error processing friend ID ${friend.id}:`, error);
                }
            }
        }

        // Import groups
        const groupsPath = path.join(mainTeamMatePublicPath, 'groups.json');
        console.log('Reading groups from:', groupsPath);
        const groupsData = JSON.parse(await fs.readFile(groupsPath, 'utf8'));
        
        for (const group of groupsData) {
            try {
                await groupsCollection.updateOne(
                    { id: group.id },
                    { $set: group },
                    { upsert: true }
                );
                console.log(`Group with ID ${group.id} processed successfully`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Duplicate group ID ${group.id} skipped`);
                } else {
                    console.error(`Error processing group ID ${group.id}:`, error);
                }
            }
        }

        // Import messages
        const messagesPath = path.join(mainTeamMatePublicPath, 'messages.json');
        console.log('Reading messages from:', messagesPath);
        const messagesData = JSON.parse(await fs.readFile(messagesPath, 'utf8'));
        
        for (const message of messagesData) {
            try {
                await messagesCollection.updateOne(
                    {
                        senderID: message.senderID,
                        receiverID: message.receiverID,
                        time: message.time
                    },
                    { $set: message },
                    { upsert: true }
                );
                console.log(`Message from ${message.senderID} to ${message.receiverID} at ${message.time} processed successfully`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Duplicate message skipped: ${message.senderID} to ${message.receiverID} at ${message.time}`);
                } else {
                    console.error(`Error processing message:`, error);
                }
            }
        }

    } catch (error) {
        console.error('Main error:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

importDataToMongoDB();

// mongodb+srv://orucirael:orucirael@cluster0.kxyhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0