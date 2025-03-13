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

function FriendsChatbox({ activeChat, allUsers = [] }) {
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

    useEffect(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        localStorage.removeItem('chatMessages'); // DELETE THIS ONLY WHEN YOU NEED TO TEST LOCALSTORAGE
        if (storedMessages) {
            try {
                const parsedMessages = JSON.parse(storedMessages);
                
                // Add unique IDs to any messages that don't have them
                const messagesWithIds = parsedMessages.map((msg, index) => {
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

        // Click handler to close menu when clicking outside
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

    useEffect(() => {
        if (messages.length > 0 && activeChat) {
            if (activeChat.chatType === 'group') {
                // Filter group messages for the active group
                const groupMessages = messages.filter(msg => 
                    (msg.type === 'group' || msg.groupID) && msg.groupID === activeChat.id
                );
                setFilteredMessages(groupMessages);
                
                // Set group members
                if (activeChat.members) {
                    setGroupMembers(activeChat.members);
                } else {
                    setGroupMembers([]);
                }
            } else {
                // Default to direct messages
                // Filter direct messages between the two users
                const directMessages = messages.filter(msg => 
                    (msg.type !== 'group' && !msg.groupID) && 
                    ((msg.senderID === activeChat.id && msg.receiverID === "1") || 
                     (msg.senderID === "1" && msg.receiverID === activeChat.id))
                );
                setFilteredMessages(directMessages);
            }
        } else {
            setFilteredMessages([]);
        }
    }, [messages, activeChat, allUsers]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !activeChat) return;
        
        // Create a new message object based on chat type
        let newMessageObj;
        
        if (activeChat.chatType === 'group') {
            newMessageObj = {
                id: generateUniqueId(),
                senderID: "1", // Current user's ID
                groupID: activeChat.id,
                type: 'group',
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
        } else {
            newMessageObj = {
                id: generateUniqueId(),
                senderID: "1", // Current user's ID
                receiverID: activeChat.id,
                type: 'direct',
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
        }

        const updatedMessages = [...messages, newMessageObj];
        setMessages(updatedMessages);
        
        // Save to localStorage
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        
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
        // Safely filter out only the specific message by ID
        const messageToDelete = messages.find(msg => msg.id === messageId);
        
        if (messageToDelete) {
            const updatedMessages = messages.filter(msg => msg.id !== messageId);
            setMessages(updatedMessages);
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        }
        
        setActiveMessageMenu(null);
    };

    return (
        <>{ activeChat && (
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

                                const isCurrentUser = msg.senderID === "1";
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