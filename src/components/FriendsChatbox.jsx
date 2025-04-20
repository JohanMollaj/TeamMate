import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane, FaTrash, FaPen, FaCopy } from "react-icons/fa6";
import { EllipsisVertical } from 'lucide-react';
import ProfileCardPopup from './ProfileCardPopup';
import MediaGallery from './MediaGallery';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// Helper functions from dashboard
const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(' ');
    if (words.length === 1) {
        return name.substring(0, 1).toUpperCase() + 
            (name.length > 1 ? name.substring(1, 2).toLowerCase() : "");
    } else {
        return words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
    }
};

const pastelColors = [
    "#c25151", // red
    "#bd7d3c", // orange
    "#5db54c", // green
    "#4ea4a6", // light blue
    "#555b9e", // blue
    "#7e599c", // purple
];

const getConsistentColor = (name) => {
    if (!name) return pastelColors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
};

function FriendsChatbox({ activeChat, allUsers = [] }) {
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const messageMenuRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
    const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);

    // Add this function to your FriendsChatbox component

    const handleEditDescription = async (group, newDescription) => {
        console.log(`Updating description for group "${group.name}"`);
        
        try {
            // In a real app, update the group description in Firestore
            // For example:
            // const groupRef = doc(db, "groups", group.id);
            // await updateDoc(groupRef, { description: newDescription });
            
            // For this demo, we'll just update localStorage
            const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
            const updatedGroups = savedGroups.map(g => {
                if (g.id === group.id) {
                    return { ...g, description: newDescription };
                }
                return g;
            });
            
            localStorage.setItem('groups', JSON.stringify(updatedGroups));
            
            // Update the active chat with the new description
            if (activeChat.id === group.id) {
                const updatedChat = { ...activeChat, description: newDescription };
                localStorage.setItem("lastActiveChat", JSON.stringify(updatedChat));
                
                // In a real app with Firebase, this would happen automatically through listeners
                setActiveChat(updatedChat);
            }
            
            // Show success message
            alert(`Group description updated successfully!`);
            
        } catch (error) {
            console.error("Error updating group description:", error);
            alert("Failed to update group description. Please try again.");
        }
    };

    const handleViewMedia = (chat) => {
        console.log(`Viewing media for ${chat.chatType === 'group' ? 'group' : 'user'}: ${chat.name}`);
        setIsMediaGalleryOpen(true);
        setIsProfileCardOpen(false); // Close the profile card when opening media gallery
    };

    // Helper function to get user by ID
    const getUserById = (userId) => {
        const user = allUsers.find(user => user.id === userId);
        if (user) return user;
        
        // Fallback to users from Firebase (future enhancement)
        return { id: userId, name: `User ${userId}` };
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);    

    // Scroll to bottom when active chat changes
    useEffect(() => {
        if (messagesEndRef.current && activeChat) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }, 100);
        }
    }, [activeChat]); 

    // Listen for messages from Firebase
    useEffect(() => {
        if (!activeChat || !auth.currentUser) return;

        setLoading(true);
        setError(null);
        
        // Reference to unsubscribe from listener
        let unsubscribe = () => {};
        
        try {
            if (activeChat.chatType === 'group') {
                // For group messages
                const q = query(
                    collection(db, "messages"),
                    where("groupId", "==", activeChat.id),
                    where("type", "==", "group"),
                    orderBy("timestamp", "asc")
                );
                
                unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const fetchedMessages = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setMessages(fetchedMessages);
                    setLoading(false);
                }, (err) => {
                    console.error("Error fetching messages:", err);
                    setError("Error loading messages. Please try again.");
                    setLoading(false);
                });
                
                // Set group members (would ideally come from Firestore)
                if (activeChat.members) {
                    setGroupMembers(activeChat.members);
                } else {
                    setGroupMembers([auth.currentUser.uid]); // Default to just current user
                }
                
            } else {
                // For direct messages between two users
                const q = query(
                    collection(db, "messages"),
                    where("type", "==", "direct"),
                    where("participants", "array-contains", auth.currentUser.uid),
                    orderBy("timestamp", "asc")
                );
                
                unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const fetchedMessages = querySnapshot.docs
                        .map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }))
                        .filter(message => 
                            message.participants && 
                            message.participants.includes(activeChat.id)
                        );
                    
                    setMessages(fetchedMessages);
                    setLoading(false);
                }, (err) => {
                    console.error("Error fetching messages:", err);
                    setError("Error loading messages. Please try again.");
                    setLoading(false);
                });
            }
        } catch (err) {
            console.error("Error setting up message listener:", err);
            setError("Error connecting to chat service.");
            setLoading(false);
        }
        
        // Clean up listener on unmount or when activeChat changes
        return () => unsubscribe();
    }, [activeChat]);

    // Handle message input changes
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    // Send a new message
    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !activeChat || !auth.currentUser) return;
        
        try {
            const currentUser = auth.currentUser;
            
            if (activeChat.chatType === 'group') {
                // Send a group message
                await addDoc(collection(db, "messages"), {
                    senderId: currentUser.uid,
                    senderName: currentUser.displayName,
                    groupId: activeChat.id,
                    type: "group",
                    // For now, just include current user in participants
                    // In a real app, fetch all group members from the group document
                    participants: groupMembers.length > 0 ? 
                        groupMembers : [currentUser.uid],
                    message: newMessage.trim(),
                    timestamp: serverTimestamp(),
                    edited: false
                });
            } else {
                // Send a direct message
                await addDoc(collection(db, "messages"), {
                    senderId: currentUser.uid,
                    senderName: currentUser.displayName,
                    receiverId: activeChat.id,
                    type: "direct",
                    participants: [currentUser.uid, activeChat.id],
                    message: newMessage.trim(),
                    timestamp: serverTimestamp(),
                    edited: false
                });
            }
            
            // Clear input field
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            // You could add an error toast here
        }
    };

    // Handle keyboard input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editingMessageId) {
                handleEditSave();
            } else {
                handleSendMessage();
            }
        }
    };

    // Toggle message options menu
    const handleToggleMessageMenu = (messageId, event) => {
        event.stopPropagation();
        if (activeMessageMenu === messageId) {
            setActiveMessageMenu(null);
        } else {
            setActiveMessageMenu(messageId);
        }
    };

    // Start editing a message
    const handleEditStart = (message) => {
        setEditingMessageId(message.id);
        setEditText(message.message);
        setActiveMessageMenu(null);
    };

    // Handle edit text changes
    const handleEditChange = (e) => {
        setEditText(e.target.value);
    };

    // Save edited message
    const handleEditSave = async () => {
        if (editText.trim() === '') return;

        try {
            const messageRef = doc(db, "messages", editingMessageId);
            
            await updateDoc(messageRef, {
                message: editText.trim(),
                edited: true,
                editedTimestamp: serverTimestamp()
            });
            
            setEditingMessageId(null);
            setEditText('');
        } catch (error) {
            console.error("Error editing message:", error);
            // You could add an error toast here
        }
    };

    // Cancel editing
    const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    // Copy message text
    const handleCopyMessage = (message) => {
        navigator.clipboard.writeText(message.message)
            .then(() => {
                // You could add a success toast here
                console.log('Message copied to clipboard');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
        setActiveMessageMenu(null);
    };

    // Delete a message
    const handleDeleteMessage = async (messageId) => {
        try {
            const messageRef = doc(db, "messages", messageId);
            await deleteDoc(messageRef);
            setActiveMessageMenu(null);
        } catch (error) {
            console.error("Error deleting message:", error);
            // You could add an error toast here
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    // Profile card handlers
    const handleProfileCardOpen = () => {
        setIsProfileCardOpen(true);
    };

    const handleProfileCardClose = () => {
        setIsProfileCardOpen(false);
    };

    const handleRemoveFriend = (friend) => {
        console.log(`Removing friend: ${friend.name}`);
        // Here you would implement the actual friend removal logic
        // For example, update Firestore or localStorage
        alert(`Friend ${friend.name} would be removed. (Demo only)`);
        setIsProfileCardOpen(false);
    };

    const handleLeaveGroup = (group) => {
        console.log(`Leaving group: ${group.name}`);
        // Here you would implement the actual group leaving logic
        alert(`You would leave the group ${group.name}. (Demo only)`);
        setIsProfileCardOpen(false);
    };

    const handleAddToGroup = (entity) => {
        console.log(`Adding ${entity.chatType === 'direct' ? 'friend' : 'members'} to a group`);
        // Here you would implement the logic to open a group selection dialog
        alert(`You would add ${entity.name} to a group. (Demo only)`);
        setIsProfileCardOpen(false);
    };

    const handleManageGroup = (group) => {
        console.log(`Managing group: ${group.name}`);
        // Here you would implement the group management logic
        alert(`You would manage the group ${group.name}. (Demo only)`);
        setIsProfileCardOpen(false);
    };
    
    const handleRenameGroup = async (group, newName) => {
        console.log(`Renaming group from "${group.name}" to "${newName}"`);
        
        try {
            // In a real app, you would update the group name in Firestore
            // For example:
            // const groupRef = doc(db, "groups", group.id);
            // await updateDoc(groupRef, { name: newName });
            
            // For this demo, we'll just update localStorage
            const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
            const updatedGroups = savedGroups.map(g => {
                if (g.id === group.id) {
                    return { ...g, name: newName };
                }
                return g;
            });
            
            localStorage.setItem('groups', JSON.stringify(updatedGroups));
            
            // Update the active chat with the new name
            const updatedChat = { ...activeChat, name: newName };
            localStorage.setItem("lastActiveChat", JSON.stringify(updatedChat));
            
            // Show success message
            alert(`Group renamed to "${newName}" successfully!`);
            
            // Update UI - in a real app, this would happen automatically via Firebase listeners
            // For demo purposes, we'll reload the page to see the changes
            window.location.reload();
            
        } catch (error) {
            console.error("Error renaming group:", error);
            alert("Failed to rename group. Please try again.");
        }
        
        setIsProfileCardOpen(false);
    };

    return (
        <>{ activeChat && (
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <div 
                        className='userHeader'
                        onClick={handleProfileCardOpen}
                        style={{ cursor: 'pointer' }}
                        title="Click for more options"
                    >
                        {activeChat.profileImage || activeChat.groupImage ? (
                            <img 
                                src={activeChat.profileImage || activeChat.groupImage} 
                                alt={activeChat.name} 
                                className="friend-avatar" 
                            />
                        ) : (
                            <div 
                                className="friend-avatar initials-avatar"
                                style={{ backgroundColor: getConsistentColor(activeChat.name) }}
                            >
                                {getInitials(activeChat.name)}
                            </div>
                        )}
                        <h1>{activeChat.name}</h1>
                        {activeChat.chatType === 'direct' && (
                            <span className={`status-indicator ${activeChat.isOnline ? "online" : "offline"}`}></span>
                        )}
                        {activeChat.chatType === 'group' && (
                            <span className="member-count">{`${groupMembers.length || 0} members`}</span>
                        )}
                    </div>
                </div>
                <div className='chatboxMain'>
                    <div className="chatboxMessages">
                        {loading ? (
                            <div className="loading-message">
                                <p className='text-[var(--text-secondary)]'>Loading messages...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">
                                <p className='text-red-500'>{error}</p>
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg) => {
                                // Format the timestamp (handle both server timestamp and client-side timestamp)
                                const messageDate = msg.timestamp instanceof Timestamp ? 
                                    msg.timestamp.toDate() : 
                                    new Date(msg.timestamp);
                                
                                const formattedDate = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                                const isCurrentUser = msg.senderId === auth.currentUser?.uid;
                                let senderName;
                                
                                if (activeChat.chatType === 'direct') {
                                    senderName = isCurrentUser ? "You" : activeChat.name;
                                } else {
                                    // For group chats, show the sender's name
                                    senderName = isCurrentUser ? "You" : (msg.senderName || getUserById(msg.senderId)?.name || "Unknown User");
                                }

                                return (
                                    <div key={msg.id} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                                        <div className="message-container">
                                            <span className="messageSender">{senderName}: </span>
                                            
                                            {editingMessageId === msg.id ? (
                                                <div className="edit-container">
                                                    <textarea 
                                                        value={editText}
                                                        onChange={handleEditChange}
                                                        onKeyDown={handleKeyDown}
                                                        className="edit-input"
                                                        autoFocus
                                                    />
                                                    <div className="edit-buttons">
                                                        <button onClick={handleEditSave} className="edit-save">Save</button>
                                                        <button onClick={handleEditCancel} className="edit-cancel">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="messageText">{msg.message}</span>
                                                    {msg.edited && <span className="edited-indicator">(edited)</span>}
                                                </>
                                            )}
                                            
                                            <span className="messageTime">
                                                {formattedDate} • {formattedTime}
                                            </span>
                                            
                                            {isCurrentUser && !editingMessageId && (
                                                <div className="message-options">
                                                    <button 
                                                        className="options-button"
                                                        onClick={(e) => handleToggleMessageMenu(msg.id, e)}
                                                    >
                                                        <EllipsisVertical />
                                                    </button>
                                                    
                                                    {activeMessageMenu === msg.id && (
                                                        <div className="options-menu" ref={messageMenuRef}>
                                                            <button 
                                                                className="menu-option"
                                                                onClick={() => handleEditStart(msg)}
                                                            >
                                                                <FaPen />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button 
                                                                className="menu-option"
                                                                onClick={() => handleCopyMessage(msg)}
                                                            >
                                                                <FaCopy />
                                                                <span>Copy</span>
                                                            </button>
                                                            <button 
                                                                className="menu-option delete"
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                            >
                                                                <FaTrash />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-messages">
                                <p className='text-[var(--text-secondary)]'>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} /> {/* Invisible scroll target */}
                    </div>
                    
                    <div className='chatbox'>
                        <button className='chatboxButton add'>
                            <FaCirclePlus />
                        </button>
                        <div className='chatboxMessage'>
                            <input 
                                type='text' 
                                className='chatboxInput' 
                                placeholder={`Message ${activeChat.chatType === 'group' ? activeChat.name : ''}...`}
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                            />
                        </div>
                        <button 
                            className='chatboxButton send'
                            onClick={handleSendMessage}
                            disabled={loading || newMessage.trim() === ''}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>

                {/* Profile Card Popup */}
                <ProfileCardPopup
                    chat={activeChat}
                    isOpen={isProfileCardOpen}
                    onClose={handleProfileCardClose}
                    onRemoveFriend={handleRemoveFriend}
                    onLeaveGroup={handleLeaveGroup}
                    onAddToGroup={handleAddToGroup}
                    onManageGroup={handleManageGroup}
                    onRenameGroup={handleRenameGroup}
                    onViewMedia={handleViewMedia}
                    onEditDescription={handleEditDescription}
                />
                <MediaGallery 
                    isOpen={isMediaGalleryOpen}
                    onClose={() => setIsMediaGalleryOpen(false)}
                    chat={activeChat}
                    messages={messages}
                />
            </div>
        )}
        </>
    );
}

export default FriendsChatbox;