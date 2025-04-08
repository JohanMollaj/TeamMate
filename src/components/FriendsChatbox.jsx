import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane, FaTrash, FaPen, FaCopy } from "react-icons/fa6";
import { EllipsisVertical } from 'lucide-react';

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

// Generate a truly unique ID for messages
const generateUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function FriendsChatbox({ activeChat, allUsers = [], currentUser }) {
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const messageMenuRef = useRef(null);

    // Helper function to get user by ID
    const getUserById = (userId) => {
        return allUsers.find(user => user.id === userId) || { id: userId, name: `User ${userId}` };
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages]); // Scroll when filtered messages update    

    useEffect(() => {
        if (messagesEndRef.current && activeChat) {
            // Force scroll to bottom when chat changes
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }, 100);
        }
    }, [activeChat]); 

    // Load messages from localStorage
    useEffect(() => {
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
        if (!currentUser || !activeChat) return;

        const loadMessages = () => {
            try {
                // Get all messages from localStorage
                const allMessagesObj = JSON.parse(localStorage.getItem('messages') || '{}');
                
                // Initialize user's message array if not exists
                if (!allMessagesObj[currentUser.id]) {
                    allMessagesObj[currentUser.id] = [];
                    localStorage.setItem('messages', JSON.stringify(allMessagesObj));
                }
                
                // Get user's messages
                const userMessages = allMessagesObj[currentUser.id];
                
                // Add unique IDs to any messages that don't have them
                const messagesWithIds = userMessages.map((msg) => {
=======
        const storedMessages = localStorage.getItem('chatMessages');
        localStorage.removeItem('chatMessages'); // DELETE THIS ONLY WHEN YOU NEED TO TEST LOCALSTORAGE
        if (storedMessages) {
            try {
                const parsedMessages = JSON.parse(storedMessages);
                
                // Add unique IDs to any messages that don't have them
                const messagesWithIds = parsedMessages.map((msg, index) => {
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
                    if (!msg.id) {
                        return {
                            ...msg,
                            id: generateUniqueId(),
                            type: msg.groupID ? 'group' : 'direct'
                        };
                    }
                    return msg;
                });
                
                setMessages(messagesWithIds);
                
                // Update localStorage with the IDs if needed
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
                if (JSON.stringify(messagesWithIds) !== JSON.stringify(userMessages)) {
                    allMessagesObj[currentUser.id] = messagesWithIds;
                    localStorage.setItem('messages', JSON.stringify(allMessagesObj));
                }
            } catch (error) {
                console.error("Error loading messages from localStorage:", error);
                setMessages([]);
            }
        };
        
        loadMessages();
        
        // Set up event listener to reload messages when changed from another component
        const handleStorageChange = (e) => {
            if (e.key === 'messages') {
                loadMessages();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
=======
                if (JSON.stringify(messagesWithIds) !== storedMessages) {
                    localStorage.setItem('chatMessages', JSON.stringify(messagesWithIds));
                }
            } catch (error) {
                console.error("Error parsing messages from localStorage:", error);
                setMessages([]);
                localStorage.removeItem('chatMessages');
            }
        } else {
            fetch("/messages.json")
                .then(response => response.json())
                .then(data => {
                    // Initialize with type field if it doesn't exist
                    const updatedData = data.map((msg) => ({
                        ...msg,
                        id: generateUniqueId(), // Generate a truly unique ID
                        type: msg.groupID ? 'group' : 'direct'
                    }));
                    setMessages(updatedData);
                    localStorage.setItem('chatMessages', JSON.stringify(updatedData));
                })
                .catch(error => {
                    console.error("Error loading messages:", error);
                    setMessages([]);
                });
        }

>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
        // Click handler to close menu when clicking outside
        const handleOutsideClick = (event) => {
            if (messageMenuRef.current && !messageMenuRef.current.contains(event.target)) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('storage', handleStorageChange);
        };
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
    }, [currentUser, activeChat, allUsers]);

    // Filter messages based on active chat
=======
    }, []);

>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
    useEffect(() => {
        if (messages.length > 0 && activeChat && currentUser) {
            if (activeChat.chatType === 'group') {
                // Filter group messages for the active group
                const groupMessages = messages.filter(msg => 
                    (msg.type === 'group' || msg.groupID) && msg.groupID === activeChat.id
                );
                setFilteredMessages(groupMessages);
                
                // Set group members
                if (activeChat.members) {
                    // Get the full user data for each group member
                    const members = activeChat.members.map(memberId => 
                        allUsers.find(user => user.id === memberId) || { id: memberId, name: `User ${memberId}` }
                    );
                    setGroupMembers(members);
                } else {
                    setGroupMembers([]);
                }
            } else {
                // Filter direct messages between the two users
                const directMessages = messages.filter(msg => 
                    (msg.type !== 'group' && !msg.groupID) && 
                    ((msg.senderID === activeChat.id && msg.receiverID === currentUser.id) || 
                     (msg.senderID === currentUser.id && msg.receiverID === activeChat.id))
                );
                setFilteredMessages(directMessages);
            }
        } else {
            setFilteredMessages([]);
        }
    }, [messages, activeChat, allUsers, currentUser]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
        if (newMessage.trim() === '' || !activeChat || !currentUser) return;
=======
        if (newMessage.trim() === '' || !activeChat) return;
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
        
        // Create a new message object based on chat type
        let newMessageObj;
        
        if (activeChat.chatType === 'group') {
            newMessageObj = {
                id: generateUniqueId(),
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
                senderID: currentUser.id,
=======
                senderID: "1", // Current user's ID
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
                groupID: activeChat.id,
                type: 'group',
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
        } else {
            newMessageObj = {
                id: generateUniqueId(),
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
                senderID: currentUser.id,
=======
                senderID: "1", // Current user's ID
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
                receiverID: activeChat.id,
                type: 'direct',
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
        }

<<<<<<< Updated upstream:src/components/FriendsChatbox.js
        // Add to current user's messages
        const allMessagesObj = JSON.parse(localStorage.getItem('messages') || '{}');
        
        if (!allMessagesObj[currentUser.id]) {
            allMessagesObj[currentUser.id] = [];
        }
        
        allMessagesObj[currentUser.id].push(newMessageObj);
        
        // If direct message, add to receiver's messages too
        if (activeChat.chatType !== 'group') {
            if (!allMessagesObj[activeChat.id]) {
                allMessagesObj[activeChat.id] = [];
            }
            
            allMessagesObj[activeChat.id].push(newMessageObj);
            
            // Create notification for the recipient
            const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
            
            if (!notifications[activeChat.id]) {
                notifications[activeChat.id] = [];
            }
            
            // Only add notification if the user is offline
            const isUserOffline = allUsers.find(u => u.id === activeChat.id)?.isOnline === false;
            
            if (isUserOffline) {
                notifications[activeChat.id].unshift({
                    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'message',
                    title: `New message from ${currentUser.name}`,
                    message: newMessage.length > 30 ? newMessage.slice(0, 30) + '...' : newMessage,
                    time: new Date().toISOString(),
                    read: false,
                    senderId: currentUser.id
                });
                
                localStorage.setItem('notifications', JSON.stringify(notifications));
            }
        } else {
            // For group messages, add to all members' message lists
            activeChat.members.forEach(memberId => {
                if (memberId !== currentUser.id) {
                    if (!allMessagesObj[memberId]) {
                        allMessagesObj[memberId] = [];
                    }
                    
                    allMessagesObj[memberId].push(newMessageObj);
                    
                    // Generate notification for group message
                    const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
                    
                    if (!notifications[memberId]) {
                        notifications[memberId] = [];
                    }
                    
                    // Only add notification if the user is offline
                    const isUserOffline = allUsers.find(u => u.id === memberId)?.isOnline === false;
                    
                    if (isUserOffline) {
                        notifications[memberId].unshift({
                            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            type: 'group_message',
                            title: `New message in ${activeChat.name}`,
                            message: `${currentUser.name}: ${newMessage.length > 30 ? newMessage.slice(0, 30) + '...' : newMessage}`,
                            time: new Date().toISOString(),
                            read: false,
                            senderId: currentUser.id,
                            groupId: activeChat.id
                        });
                        
                        localStorage.setItem('notifications', JSON.stringify(notifications));
                    }
                }
            });
        }
        
        // Save all messages
        localStorage.setItem('messages', JSON.stringify(allMessagesObj));
        
        // Update local state
        setMessages(prevMessages => [...prevMessages, newMessageObj]);
=======
        const updatedMessages = [...messages, newMessageObj];
        setMessages(updatedMessages);
        
        // Save to localStorage
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
        
        // Clear input field
        setNewMessage('');
    };

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

    const handleToggleMessageMenu = (messageId, event) => {
        event.stopPropagation();
        if (activeMessageMenu === messageId) {
            setActiveMessageMenu(null);
        } else {
            setActiveMessageMenu(messageId);
        }
    };

    const handleEditStart = (message) => {
        setEditingMessageId(message.id);
        setEditText(message.message);
        setActiveMessageMenu(null);
    };

    const handleEditChange = (e) => {
        setEditText(e.target.value);
    };

    const handleEditSave = () => {
<<<<<<< Updated upstream:src/components/FriendsChatbox.js
        if (editText.trim() === '' || !currentUser) return;

        // Update in localStorage
        const allMessagesObj = JSON.parse(localStorage.getItem('messages') || '{}');
        
        // Find and update the message
        if (allMessagesObj[currentUser.id]) {
            const messageIndex = allMessagesObj[currentUser.id].findIndex(msg => msg.id === editingMessageId);
            
            if (messageIndex !== -1) {
                const updatedMessage = {
                    ...allMessagesObj[currentUser.id][messageIndex],
                    message: editText.trim(),
                    edited: true
                };
                
                allMessagesObj[currentUser.id][messageIndex] = updatedMessage;
                
                // If it's a direct message, also update in the recipient's messages
                if (updatedMessage.type === 'direct') {
                    const receiverId = updatedMessage.receiverID === currentUser.id ? 
                        updatedMessage.senderID : updatedMessage.receiverID;
                    
                    if (allMessagesObj[receiverId]) {
                        const recipientMsgIndex = allMessagesObj[receiverId].findIndex(msg => msg.id === editingMessageId);
                        
                        if (recipientMsgIndex !== -1) {
                            allMessagesObj[receiverId][recipientMsgIndex] = updatedMessage;
                        }
                    }
                }
                // If it's a group message, update for all members
                else if (updatedMessage.type === 'group' && activeChat.members) {
                    activeChat.members.forEach(memberId => {
                        if (memberId !== currentUser.id && allMessagesObj[memberId]) {
                            const memberMsgIndex = allMessagesObj[memberId].findIndex(msg => msg.id === editingMessageId);
                            
                            if (memberMsgIndex !== -1) {
                                allMessagesObj[memberId][memberMsgIndex] = updatedMessage;
                            }
                        }
                    });
                }
                
                localStorage.setItem('messages', JSON.stringify(allMessagesObj));
                
                // Update local state
                setMessages(prevMessages => 
                    prevMessages.map(msg => 
                        msg.id === editingMessageId ? 
                        { ...msg, message: editText.trim(), edited: true } : 
                        msg
                    )
                );
            }
=======
        if (editText.trim() === '') return;

        // Safely find and update just the specific message by ID
        const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
        
        if (messageIndex !== -1) {
            const updatedMessages = [...messages];
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                message: editText.trim(),
                edited: true
            };
            
            setMessages(updatedMessages);
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
>>>>>>> Stashed changes:src/components/FriendsChatbox.jsx
        }
        
        setEditingMessageId(null);
        setEditText('');
    };

    const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const handleCopyMessage = (message) => {
        navigator.clipboard.writeText(message.message)
            .then(() => {
                // Maybe show a toast notification here
                console.log('Message copied to clipboard');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
        setActiveMessageMenu(null);
    };

    const handleDeleteMessage = (messageId) => {
        if (!currentUser) return;
        
        // Get the message to check its type
        const messageToDelete = messages.find(msg => msg.id === messageId);
        
        if (!messageToDelete) return;
        
        // Update localStorage
        const allMessagesObj = JSON.parse(localStorage.getItem('messages') || '{}');
        
        // Remove from current user's messages
        if (allMessagesObj[currentUser.id]) {
            allMessagesObj[currentUser.id] = allMessagesObj[currentUser.id].filter(msg => msg.id !== messageId);
            
            // If direct message, also remove from recipient's messages
            if (messageToDelete.type === 'direct') {
                const receiverId = messageToDelete.receiverID === currentUser.id ? 
                    messageToDelete.senderID : messageToDelete.receiverID;
                
                if (allMessagesObj[receiverId]) {
                    allMessagesObj[receiverId] = allMessagesObj[receiverId].filter(msg => msg.id !== messageId);
                }
            }
            // If group message, delete for all members
            else if (messageToDelete.type === 'group' && activeChat.members) {
                activeChat.members.forEach(memberId => {
                    if (memberId !== currentUser.id && allMessagesObj[memberId]) {
                        allMessagesObj[memberId] = allMessagesObj[memberId].filter(msg => msg.id !== messageId);
                    }
                });
            }
            
            localStorage.setItem('messages', JSON.stringify(allMessagesObj));
            
            // Update local state
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        }
        
        setActiveMessageMenu(null);
    };

    return (
        <>{ activeChat && currentUser && (
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <div className='userHeader'>
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
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => {
                                const messageDate = new Date(msg.time);
                                const formattedDate = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                                const isCurrentUser = msg.senderID === currentUser.id;
                                let senderName;
                                
                                if (activeChat.chatType === 'direct') {
                                    senderName = isCurrentUser ? "You" : activeChat.name;
                                } else {
                                    // For group chats, we need to show the sender's name
                                    senderName = isCurrentUser ? "You" : getUserById(msg.senderID).name;
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
                            />
                        </div>
                        <button 
                            className='chatboxButton send'
                            onClick={handleSendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default FriendsChatbox;