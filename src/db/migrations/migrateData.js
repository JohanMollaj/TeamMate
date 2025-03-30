// src/db/migrations/simpleMigrate.js
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teamMate';
const dbName = process.env.DB_NAME || 'teamMate';

// File paths
const FILES = {
  friends: path.resolve(__dirname, '../../../public/friends.json'),
  groups: path.resolve(__dirname, '../../../public/groups.json'),
  messages: path.resolve(__dirname, '../../../public/messages.json'),
  tasks: path.resolve(__dirname, '../../../public/tasks.json'),
  gradedTasks: path.resolve(__dirname, '../../../public/gradedTasks.json')
};

// Read a JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Hash a password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function simpleMigration() {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // 1. MIGRATE USERS FROM FRIENDS.JSON
    console.log('Migrating users...');
    const friends = await readJsonFile(FILES.friends);
    
    if (friends && friends.length > 0) {
      const usersCollection = db.collection('users');
      const existingCount = await usersCollection.countDocuments();
      
      if (existingCount === 0) {
        const defaultPassword = await hashPassword('password123');
        const now = new Date();
        
        const users = await Promise.all(friends.map(async (friend) => ({
          username: friend.name.toLowerCase().replace(/\s+/g, '.'),
          name: friend.name,
          email: `${friend.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          password: defaultPassword,
          profileImage: null,
          isOnline: friend.isOnline || false,
          lastActive: now,
          friends: [],
          friendRequests: [],
          bio: "",
          createdAt: now,
          updatedAt: now
        })));
        
        const result = await usersCollection.insertMany(users);
        console.log(`Successfully inserted ${result.insertedCount} users`);
      } else {
        console.log(`Found ${existingCount} existing users. Skipping users migration.`);
      }
    }
    
    // 2. MIGRATE FRIEND RELATIONSHIPS
    console.log('Setting up friend relationships...');
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length > 1) {
      const friendsCollection = db.collection('friends');
      const existingFriendsCount = await friendsCollection.countDocuments();
      
      if (existingFriendsCount === 0) {
        // Create some sample friendships
        const friendships = [];
        
        // Make every user friends with the first user
        for (let i = 1; i < users.length; i++) {
          friendships.push({
            user1Id: users[0]._id,
            user2Id: users[i]._id,
            status: 'accepted',
            initiatedBy: users[0]._id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Create some random friendship requests
        for (let i = 1; i < users.length - 1; i++) {
          friendships.push({
            user1Id: users[i]._id,
            user2Id: users[i + 1]._id,
            status: 'pending',
            initiatedBy: users[i]._id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        if (friendships.length > 0) {
          const result = await friendsCollection.insertMany(friendships);
          console.log(`Successfully inserted ${result.insertedCount} friendships`);
        }
      } else {
        console.log(`Found ${existingFriendsCount} existing friendships. Skipping.`);
      }
    }
    
    // 3. MIGRATE GROUPS
    console.log('Migrating groups...');
    const groups = await readJsonFile(FILES.groups);
    
    if (groups && groups.length > 0 && users.length > 0) {
      const groupsCollection = db.collection('groups');
      const existingCount = await groupsCollection.countDocuments();
      
      if (existingCount === 0) {
        const now = new Date();
        
        const formattedGroups = groups.map(group => {
          // Assign random members (between 2-4 users)
          const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
          const memberCount = Math.min(Math.floor(Math.random() * 3) + 2, users.length);
          const groupMembers = shuffledUsers.slice(0, memberCount);
          
          return {
            name: group.name,
            description: `Group for ${group.name}`,
            groupImage: null,
            createdBy: groupMembers[0]._id,
            members: groupMembers.map((user, index) => ({
              userId: user._id,
              role: index === 0 ? 'admin' : 'member',
              joinedAt: now
            })),
            inviteCode: Math.random().toString(36).substring(2, 10),
            createdAt: now,
            updatedAt: now
          };
        });
        
        const result = await groupsCollection.insertMany(formattedGroups);
        console.log(`Successfully inserted ${result.insertedCount} groups`);
      } else {
        console.log(`Found ${existingCount} existing groups. Skipping groups migration.`);
      }
    }
    
    // 4. MIGRATE MESSAGES
    console.log('Migrating messages...');
    const messages = await readJsonFile(FILES.messages);
    
    if (messages && messages.length > 0 && users.length > 0) {
      const messagesCollection = db.collection('messages');
      const existingCount = await messagesCollection.countDocuments();
      
      if (existingCount === 0) {
        // Get all groups
        const groups = await db.collection('groups').find({}).toArray();
        
        const formattedMessages = messages.map(msg => {
          // Find users for this message
          const senderIndex = parseInt(msg.senderID || 1) - 1;
          const sender = users[senderIndex % users.length];
          
          if (msg.type === 'group' || msg.groupID) {
            // Group message
            const groupIndex = parseInt(msg.groupID || 1) - 1;
            const group = groups[groupIndex % groups.length];
            
            return {
              sender: sender._id,
              group: group._id,
              type: 'group',
              content: msg.message,
              attachments: [],
              readBy: [sender._id],
              edited: false,
              createdAt: new Date(msg.time || new Date()),
              updatedAt: null
            };
          } else {
            // Direct message
            const receiverIndex = parseInt(msg.receiverID || 2) - 1;
            const receiver = users[receiverIndex % users.length];
            
            return {
              sender: sender._id,
              receiver: receiver._id,
              type: 'direct',
              content: msg.message,
              attachments: [],
              readBy: [sender._id],
              edited: false,
              createdAt: new Date(msg.time || new Date()),
              updatedAt: null
            };
          }
        });
        
        const result = await messagesCollection.insertMany(formattedMessages);
        console.log(`Successfully inserted ${result.insertedCount} messages`);
      } else {
        console.log(`Found ${existingCount} existing messages. Skipping messages migration.`);
      }
    }
    
    // 5. MIGRATE TASKS
    console.log('Migrating tasks...');
    const tasksData = await readJsonFile(FILES.tasks);
    
    if (tasksData && tasksData.tasks && tasksData.tasks.length > 0 && users.length > 0) {
      const tasksCollection = db.collection('tasks');
      const existingCount = await tasksCollection.countDocuments();
      
      if (existingCount === 0) {
        // Get all groups
        const groups = await db.collection('groups').find({}).toArray();
        
        const formattedTasks = tasksData.tasks.map(task => {
          // Select random users for assignment
          const assignerIndex = Math.floor(Math.random() * users.length);
          const assignedToIndex = Math.floor(Math.random() * users.length);
          const assigner = users[assignerIndex];
          const assignedTo = users[assignedToIndex];
          
          // Randomly assign to a group (50% chance)
          let group = null;
          if (groups.length > 0 && Math.random() > 0.5) {
            const groupIndex = Math.floor(Math.random() * groups.length);
            group = groups[groupIndex]._id;
          }
          
          return {
            title: task.title,
            description: task.description || '',
            dueDate: new Date(task.dueDate),
            assignedBy: assigner._id,
            assignedTo: assignedTo._id,
            group,
            completed: task.completed || false,
            completedAt: task.completed ? new Date() : null,
            priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
            attachments: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });
        
        const result = await tasksCollection.insertMany(formattedTasks);
        console.log(`Successfully inserted ${result.insertedCount} tasks`);
      } else {
        console.log(`Found ${existingCount} existing tasks. Skipping tasks migration.`);
      }
    }
    
    // 6. MIGRATE GRADED TASKS
    console.log('Migrating graded tasks...');
    const gradedTasksData = await readJsonFile(FILES.gradedTasks);
    
    if (gradedTasksData && gradedTasksData.gradedAssignments && gradedTasksData.gradedAssignments.length > 0 && users.length > 0) {
      const gradedTasksCollection = db.collection('gradedTasks');
      const existingCount = await gradedTasksCollection.countDocuments();
      
      if (existingCount === 0) {
        // Get all groups
        const groups = await db.collection('groups').find({}).toArray();
        
        if (groups.length === 0) {
          console.log('No groups found for graded tasks. Skipping.');
        } else {
          const formattedGradedTasks = gradedTasksData.gradedAssignments.map(task => {
            // Select random users for grader and student
            const graderIndex = Math.floor(Math.random() * users.length);
            const studentIndex = Math.floor(Math.random() * users.length);
            const grader = users[graderIndex];
            const student = users[studentIndex];
            
            // Select a group
            const groupIndex = (task.groupId % groups.length) || 0;
            const group = groups[groupIndex];
            
            return {
              taskName: task.taskName,
              description: `Assignment: ${task.taskName}`,
              dateGraded: new Date(task.dateGraded),
              grade: task.grade,
              feedback: task.feedback || '',
              group: group._id,
              student: student._id,
              gradedBy: grader._id,
              submissions: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
          });
          
          const result = await gradedTasksCollection.insertMany(formattedGradedTasks);
          console.log(`Successfully inserted ${result.insertedCount} graded tasks`);
        }
      } else {
        console.log(`Found ${existingCount} existing graded tasks. Skipping graded tasks migration.`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the migration
simpleMigration().catch(console.error);