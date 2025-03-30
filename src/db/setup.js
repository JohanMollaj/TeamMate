const { MongoClient } = require('mongodb');
const { connectToDatabase, closeConnection } = require('./connection');

async function setupDatabase() {
  try {
    const db = await connectToDatabase();
    console.log('Connected to database. Setting up collections...');

    // USER COLLECTION
    try {
      await db.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["username", "name", "email", "createdAt"],
            properties: {
              username: {
                bsonType: "string",
                description: "Username must be a string and is required"
              },
              password: {
                bsonType: "string",
                description: "Password hash must be a string and is required"
              },
              name: {
                bsonType: "string",
                description: "Full name must be a string and is required"
              },
              email: {
                bsonType: "string",
                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                description: "Email must be a valid email address and is required"
              },
              profileImage: {
                bsonType: ["string", "null"],
                description: "URL to the profile image"
              },
              bio: {
                bsonType: ["string", "null"],
                description: "User biography"
              },
              isOnline: {
                bsonType: "bool",
                description: "Current online status"
              },
              lastActive: {
                bsonType: "date",
                description: "Timestamp of last activity"
              },
              friends: {
                bsonType: "array",
                description: "List of user's friends",
                items: {
                  bsonType: "objectId",
                  description: "Reference to a user"
                }
              },
              friendRequests: {
                bsonType: "array",
                description: "List of pending friend requests",
                items: {
                  bsonType: "object",
                  required: ["from", "status", "createdAt"],
                  properties: {
                    from: { 
                      bsonType: "objectId",
                      description: "User who sent the request" 
                    },
                    status: { 
                      bsonType: "string",
                      enum: ["pending", "accepted", "rejected"],
                      description: "Status of the friend request" 
                    },
                    createdAt: { 
                      bsonType: "date",
                      description: "When the request was created" 
                    }
                  }
                }
              },
              createdAt: {
                bsonType: "date",
                description: "Account creation timestamp"
              },
              updatedAt: {
                bsonType: "date",
                description: "Account last update timestamp"
              }
            }
          }
        }
      });
      console.log('Users collection created successfully');
      
      // Create users indexes
      await db.collection('users').createIndex({ "username": 1 }, { unique: true });
      await db.collection('users').createIndex({ "email": 1 }, { unique: true });
      await db.collection('users').createIndex({ "name": "text" });
      console.log('User indexes created successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('Users collection already exists');
      } else {
        console.error('Error creating users collection:', error);
      }
    }

    // GROUPS COLLECTION
    try {
      await db.createCollection("groups", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "createdBy", "createdAt", "members"],
            properties: {
              name: {
                bsonType: "string",
                description: "Group name must be a string and is required"
              },
              description: {
                bsonType: ["string", "null"],
                description: "Description of the group"
              },
              groupImage: {
                bsonType: ["string", "null"],
                description: "URL to the group image"
              },
              createdBy: {
                bsonType: "objectId",
                description: "User who created the group"
              },
              members: {
                bsonType: "array",
                description: "List of group members",
                items: {
                  bsonType: "object",
                  required: ["userId", "role", "joinedAt"],
                  properties: {
                    userId: {
                      bsonType: "objectId",
                      description: "Reference to a user"
                    },
                    role: {
                      bsonType: "string",
                      enum: ["admin", "moderator", "member"],
                      description: "Role of the user in the group"
                    },
                    joinedAt: {
                      bsonType: "date",
                      description: "When the user joined the group"
                    }
                  }
                }
              },
              inviteCode: {
                bsonType: ["string", "null"],
                description: "Unique invite code for the group"
              },
              createdAt: {
                bsonType: "date",
                description: "Group creation timestamp"
              },
              updatedAt: {
                bsonType: "date",
                description: "Group last update timestamp"
              }
            }
          }
        }
      });
      console.log('Groups collection created successfully');
      
      // Create groups indexes
      await db.collection('groups').createIndex({ "name": "text" });
      await db.collection('groups').createIndex({ "inviteCode": 1 }, { unique: true, sparse: true });
      await db.collection('groups').createIndex({ "members.userId": 1 });
      console.log('Group indexes created successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('Groups collection already exists');
      } else {
        console.error('Error creating groups collection:', error);
      }
    }

    // MESSAGES COLLECTION
    try {
      await db.createCollection("messages", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["sender", "type", "createdAt", "content"],
            properties: {
              sender: {
                bsonType: "objectId",
                description: "User who sent the message"
              },
              receiver: {
                bsonType: ["objectId", "null"],
                description: "User who receives the message (for direct messages)"
              },
              group: {
                bsonType: ["objectId", "null"],
                description: "Group where the message was sent (for group messages)"
              },
              type: {
                bsonType: "string",
                enum: ["direct", "group"],
                description: "Type of message"
              },
              content: {
                bsonType: "string",
                description: "Content of the message"
              },
              attachments: {
                bsonType: ["array", "null"],
                description: "List of attachments",
                items: {
                  bsonType: "object",
                  required: ["type", "url"],
                  properties: {
                    type: {
                      bsonType: "string",
                      enum: ["image", "file", "link"],
                      description: "Type of attachment"
                    },
                    url: {
                      bsonType: "string",
                      description: "URL to the attachment"
                    },
                    name: {
                      bsonType: ["string", "null"],
                      description: "Original filename"
                    },
                    size: {
                      bsonType: ["int", "null"],
                      description: "Size of the file in bytes"
                    }
                  }
                }
              },
              readBy: {
                bsonType: ["array", "null"],
                description: "List of users who've read the message",
                items: {
                  bsonType: "objectId",
                  description: "Reference to a user"
                }
              },
              edited: {
                bsonType: "bool",
                description: "Whether the message has been edited"
              },
              createdAt: {
                bsonType: "date",
                description: "Message creation timestamp"
              },
              updatedAt: {
                bsonType: ["date", "null"],
                description: "Message last update timestamp"
              }
            }
          }
        }
      });
      console.log('Messages collection created successfully');
      
      // Create messages indexes
      await db.collection('messages').createIndex({ "sender": 1 });
      await db.collection('messages').createIndex({ "receiver": 1 });
      await db.collection('messages').createIndex({ "group": 1 });
      await db.collection('messages').createIndex({ "createdAt": 1 });
      await db.collection('messages').createIndex({ "type": 1, "sender": 1, "receiver": 1, "createdAt": -1 });
      await db.collection('messages').createIndex({ "type": 1, "group": 1, "createdAt": -1 });
      console.log('Message indexes created successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('Messages collection already exists');
      } else {
        console.error('Error creating messages collection:', error);
      }
    }

    // TASKS COLLECTION
    try {
      await db.createCollection("tasks", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["title", "dueDate", "assignedBy", "createdAt"],
            properties: {
              title: {
                bsonType: "string",
                description: "Task title must be a string and is required"
              },
              description: {
                bsonType: ["string", "null"],
                description: "Description of the task"
              },
              dueDate: {
                bsonType: "date",
                description: "Due date for the task"
              },
              assignedBy: {
                bsonType: "objectId",
                description: "User who assigned the task"
              },
              assignedTo: {
                bsonType: ["objectId", "null"],
                description: "User to whom the task is assigned"
              },
              group: {
                bsonType: ["objectId", "null"],
                description: "Group associated with the task"
              },
              completed: {
                bsonType: "bool",
                description: "Whether the task is completed"
              },
              completedAt: {
                bsonType: ["date", "null"],
                description: "When the task was completed"
              },
              priority: {
                bsonType: ["string", "null"],
                enum: ["low", "medium", "high", "urgent", null],
                description: "Priority level of the task"
              },
              attachments: {
                bsonType: ["array", "null"],
                description: "List of attachments",
                items: {
                  bsonType: "object",
                  required: ["type", "url"],
                  properties: {
                    type: {
                      bsonType: "string",
                      enum: ["image", "file", "link"],
                      description: "Type of attachment"
                    },
                    url: {
                      bsonType: "string",
                      description: "URL to the attachment"
                    },
                    name: {
                      bsonType: ["string", "null"],
                      description: "Original filename"
                    },
                    size: {
                      bsonType: ["int", "null"],
                      description: "Size of the file in bytes"
                    }
                  }
                }
              },
              createdAt: {
                bsonType: "date",
                description: "Task creation timestamp"
              },
              updatedAt: {
                bsonType: "date",
                description: "Task last update timestamp"
              }
            }
          }
        }
      });
      console.log('Tasks collection created successfully');
      
      // Create tasks indexes
      await db.collection('tasks').createIndex({ "assignedTo": 1 });
      await db.collection('tasks').createIndex({ "group": 1 });
      await db.collection('tasks').createIndex({ "dueDate": 1 });
      await db.collection('tasks').createIndex({ "completed": 1, "dueDate": 1 });
      await db.collection('tasks').createIndex({ "title": "text", "description": "text" });
      console.log('Task indexes created successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('Tasks collection already exists');
      } else {
        console.error('Error creating tasks collection:', error);
      }
    }

    // GRADED TASKS COLLECTION
    try {
      await db.createCollection("gradedTasks", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["taskName", "dateGraded", "grade", "group", "gradedBy"],
            properties: {
              taskName: {
                bsonType: "string",
                description: "Name of the graded task"
              },
              description: {
                bsonType: ["string", "null"],
                description: "Description of the task"
              },
              task: {
                bsonType: ["objectId", "null"],
                description: "Reference to the original task if applicable"
              },
              dateGraded: {
                bsonType: "date",
                description: "Date when the task was graded"
              },
              grade: {
                bsonType: "int",
                minimum: 0,
                maximum: 10,
                description: "Grade assigned (0-10)"
              },
              feedback: {
                bsonType: ["string", "null"],
                description: "Feedback for the task"
              },
              group: {
                bsonType: "objectId",
                description: "Group associated with the graded task"
              },
              student: {
                bsonType: ["objectId", "null"],
                description: "Student who submitted the task (if individual)"
              },
              gradedBy: {
                bsonType: "objectId",
                description: "User who graded the task"
              },
              submissions: {
                bsonType: ["array", "null"],
                description: "List of submitted files",
                items: {
                  bsonType: "object",
                  required: ["url", "submittedAt"],
                  properties: {
                    url: {
                      bsonType: "string",
                      description: "URL to the submission file"
                    },
                    name: {
                      bsonType: ["string", "null"],
                      description: "Original filename"
                    },
                    submittedBy: {
                      bsonType: "objectId",
                      description: "User who submitted the file"
                    },
                    submittedAt: {
                      bsonType: "date",
                      description: "When the file was submitted"
                    }
                  }
                }
              },
              createdAt: {
                bsonType: "date",
                description: "Record creation timestamp"
              },
              updatedAt: {
                bsonType: "date",
                description: "Record last update timestamp"
              }
            }
          }
        }
      });
      console.log('GradedTasks collection created successfully');
      
      // Create graded tasks indexes
      await db.collection('gradedTasks').createIndex({ "group": 1 });
      await db.collection('gradedTasks').createIndex({ "student": 1 });
      await db.collection('gradedTasks').createIndex({ "dateGraded": -1 });
      await db.collection('gradedTasks').createIndex({ "task": 1 });
      console.log('GradedTask indexes created successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('GradedTasks collection already exists');
      } else {
        console.error('Error creating gradedTasks collection:', error);
      }
    }

    // src/db/setup.js - Add this code to set up the Friends collection

// FRIENDS COLLECTION
try {
  await db.createCollection("friends", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user1Id", "user2Id", "status", "createdAt"],
        properties: {
          user1Id: {
            bsonType: "objectId",
            description: "First user in the friendship (required)"
          },
          user2Id: {
            bsonType: "objectId",
            description: "Second user in the friendship (required)"
          },
          status: {
            bsonType: "string",
            enum: ["pending", "accepted", "declined", "blocked"],
            description: "Status of the friendship"
          },
          initiatedBy: {
            bsonType: "objectId",
            description: "User who initiated the friendship request"
          },
          createdAt: {
            bsonType: "date",
            description: "When the friendship was created"
          },
          updatedAt: {
            bsonType: "date",
            description: "When the friendship was last updated"
          }
        }
      }
    }
  });
  console.log('Friends collection created successfully');
  
  // Create friends indexes
  await db.collection('friends').createIndex({ user1Id: 1, user2Id: 1 }, { unique: true });
  await db.collection('friends').createIndex({ status: 1 });
  console.log('Friends indexes created successfully');
} catch (error) {
  if (error.codeName === 'NamespaceExists') {
    console.log('Friends collection already exists');
  } else {
    console.error('Error creating friends collection:', error);
  }
}

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await closeConnection();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };