import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane } from "react-icons/fa6";

<<<<<<< Updated upstream
function FriendsChatbox({ activeChat }){
=======
// Helper functions from dashboard
const getInitials = (name) => {
    if (!name) return "U";
    const words = name.split(' ');
    if (words.length === 1) {
        return name.substring(0, 1).toUpperCase() + 
            (name.length > 1 ? name.substring(1, 2).toLowerCase() : "");
    } else {
        // First letter of first and last words, properly capitalized
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
>>>>>>> Stashed changes
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll when messages update    

    // Fetch messages when activeChat changes
    useEffect(() => {
<<<<<<< Updated upstream
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            fetch("/messages.json")
                .then(response => response.json())
                .then(data => {
                    setMessages(data);
                    localStorage.setItem('chatMessages', JSON.stringify(data));
                });
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0 && activeChat) {
            // Filter messages for conversations where the active chat user is either the sender or receiver
            const conversationMessages = messages.filter(msg => 
                (msg.senderID === activeChat.id && msg.receiverID === "1") || 
                (msg.senderID === "1" && msg.receiverID === activeChat.id)
            );
            setFilteredMessages(conversationMessages);
=======
        if (!activeChat) return;

        const fetchMessages = async () => {
            try {
                let endpoint;
                if (activeChat.chatType === 'direct') {
                    endpoint = `/api/messages/direct/${activeChat.id}`;
                } else {
                    endpoint = `/api/messages/group/${activeChat.id}`;
                }
                
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Ensure messages have unique IDs
                const messagesWithIds = data.map(msg => ({
                    ...msg,
                    id: msg._id || generateUniqueId(),
                }));
                
                setMessages(messagesWithIds);
            } catch (error) {
                console.error("Error fetching messages:", error);
                // If API fails, try to fall back to localStorage for development
                fallbackToLocalStorage();
            }
        };

        // Fallback to localStorage if API isn't working yet
        const fallbackToLocalStorage = () => {
            console.warn("Falling back to localStorage for messages");
            const storedMessages = localStorage.getItem('chatMessages');
            
            if (storedMessages) {
                try {
                    const parsedMessages = JSON.parse(storedMessages);
                    
                    // Add unique IDs to any messages that don't have them
                    const messagesWithIds = parsedMessages.map((msg) => {
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
                } catch (error) {
                    console.error("Error parsing messages from localStorage:", error);
                    setMessages([]);
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
        };

        fetchMessages();

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
    }, [activeChat]);

    useEffect(() => {
        if (messages.length > 0 && activeChat) {
            if (activeChat.chatType === 'group') {
                // Filter group messages for the active group
                const groupMessages = messages.filter(msg => 
                    (msg.type === 'group' || msg.groupID) && 
                    (msg.groupID === activeChat.id || msg.group === activeChat.id)
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
                     (msg.senderID === "1" && msg.receiverID === activeChat.id) ||
                     (msg.sender === activeChat.id && msg.receiver === "1") ||
                     (msg.sender === "1" && msg.receiver === activeChat.id))
                );
                setFilteredMessages(directMessages);
            }
        } else {
            setFilteredMessages([]);
>>>>>>> Stashed changes
        }
    }, [messages, activeChat]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !activeChat) return;
        
<<<<<<< Updated upstream
        // Create a new message object
        const newMessageObj = {
            senderID: "1", // Current user's ID
            receiverID: activeChat.id,
            time: new Date().toISOString(),
            message: newMessage.trim()
        };
=======
        // Create a new message object based on chat type
        let messageData;
        
        if (activeChat.chatType === 'group') {
            messageData = {
                sender: "1", // Current user's ID
                group: activeChat.id,
                type: 'group',
                content: newMessage.trim()
            };
        } else {
            messageData = {
                sender: "1", // Current user's ID
                receiver: activeChat.id,
                type: 'direct',
                content: newMessage.trim()
            };
        }
>>>>>>> Stashed changes

        try {
            // Send to API
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const savedMessage = await response.json();
            
            // Add to local state
            const newMessageObj = {
                ...savedMessage,
                id: savedMessage._id || generateUniqueId()
            };

            setMessages(prev => [...prev, newMessageObj]);
            
            // Clear input field
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            
            // Fallback to localStorage if API isn't working yet
            console.warn("Falling back to localStorage for sending message");
            
            // Convert API format to localStorage format for compatibility
            const fallbackMessage = {
                id: generateUniqueId(),
                senderID: "1",
                type: activeChat.chatType,
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
            
            if (activeChat.chatType === 'direct') {
                fallbackMessage.receiverID = activeChat.id;
            } else {
                fallbackMessage.groupID = activeChat.id;
            }
            
            const updatedMessages = [...messages, fallbackMessage];
            setMessages(updatedMessages);
            
            // Save to localStorage
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
            
            // Clear input field
            setNewMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

<<<<<<< Updated upstream
=======
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
        setEditText(message.message || message.content);
        setActiveMessageMenu(null);
    };

    const handleEditChange = (e) => {
        setEditText(e.target.value);
    };

    const handleEditSave = async () => {
        if (editText.trim() === '') return;

        try {
            // API version
            const messageToUpdate = messages.find(msg => msg.id === editingMessageId);
            
            // Try MongoDB _id first, fall back to id
            const messageId = messageToUpdate._id || messageToUpdate.id;
            
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: editText.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to update message');
            }

            const updatedMessage = await response.json();
            
            // Update local state
            const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
            
            if (messageIndex !== -1) {
                const updatedMessages = [...messages];
                updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    content: editText.trim(),
                    message: editText.trim(), // For backwards compatibility
                    edited: true
                };
                
                setMessages(updatedMessages);
            }
        } catch (error) {
            console.error("Error updating message:", error);
            
            // Fallback to localStorage if API isn't working yet
            console.warn("Falling back to localStorage for updating message");
            
            // Safely find and update just the specific message by ID
            const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
            
            if (messageIndex !== -1) {
                const updatedMessages = [...messages];
                updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    message: editText.trim(),
                    content: editText.trim(),
                    edited: true
                };
                
                setMessages(updatedMessages);
                localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
            }
        }
        
        setEditingMessageId(null);
        setEditText('');
    };

    const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const handleCopyMessage = (message) => {
        const textToCopy = message.message || message.content;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Maybe show a toast notification here
                console.log('Message copied to clipboard');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
        setActiveMessageMenu(null);
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            // Find the message to get MongoDB _id if available
            const messageToDelete = messages.find(msg => msg.id === messageId);
            
            // Try MongoDB _id first, fall back to id
            const idToDelete = messageToDelete._id || messageToDelete.id;
            
            const response = await fetch(`/api/messages/${idToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }
            
            // Update local state
            const updatedMessages = messages.filter(msg => msg.id !== messageId);
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Error deleting message:", error);
            
            // Fallback to localStorage if API isn't working yet
            console.warn("Falling back to localStorage for deleting message");
            
            // Safely filter out only the specific message by ID
            const updatedMessages = messages.filter(msg => msg.id !== messageId);
            setMessages(updatedMessages);
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        }
        
        setActiveMessageMenu(null);
    };

>>>>>>> Stashed changes
    return (
        <>{ activeChat &&(
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <h1 className='userHeader'>{activeChat.name}</h1>
                </div>
                <div className='chatboxMain'>
                    <div className="chatboxMessages">
<<<<<<< Updated upstream
                        {filteredMessages.map((msg, index) => {
                            const messageDate = new Date(msg.time);
                            const formattedDate = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                            const isCurrentUser = msg.senderID === "1";
                            const senderName = isCurrentUser ? "You" : activeChat.name;

                            return (
                                <div key={index} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                                    <span className="messageSender">{senderName}: </span>
                                    <span className="messageText">{msg.message} </span>
                                    <span className="messageTime">
                                        {formattedDate} • {formattedTime} {/* Display both date and time */}
                                    </span>
                                </div>
                            );
                        })}
=======
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => {
                                const messageDate = new Date(msg.time || msg.createdAt);
                                const formattedDate = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                                const isCurrentUser = (msg.senderID === "1" || msg.sender === "1");
                                let senderName;
                                
                                if (activeChat.chatType === 'direct') {
                                    senderName = isCurrentUser ? "You" : activeChat.name;
                                } else {
                                    // For group chats, we need to show the sender's name
                                    senderName = isCurrentUser ? "You" : getUserById(msg.senderID || msg.sender).name;
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
                                                    <span className="messageText">{msg.message || msg.content}</span>
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
>>>>>>> Stashed changes
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
                            placeholder='Type a message...'
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}/>
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