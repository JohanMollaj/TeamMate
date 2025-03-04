import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane } from "react-icons/fa6";

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
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);

    // Helper function to get user by ID
    const getUserById = (userId) => {
        return allUsers.find(user => user.id === userId) || { id: userId, name: `User ${userId}` };
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages]); // Scroll when filtered messages update    

    useEffect(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            fetch("/messages.json")
                .then(response => response.json())
                .then(data => {
                    // Initialize with type field if it doesn't exist
                    const updatedData = data.map(msg => ({
                        ...msg,
                        type: msg.groupID ? 'group' : 'direct'
                    }));
                    setMessages(updatedData);
                    localStorage.setItem('chatMessages', JSON.stringify(updatedData));
                })
                .catch(error => {
                    console.error("Error loading messages:", error);
                    // Initialize with empty array if fetch fails
                    setMessages([]);
                });
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0 && activeChat) {
            console.log("Active chat:", activeChat);
            console.log("Available messages:", messages);
            
            if (activeChat.chatType === 'group') {
                // Filter group messages for the active group
                const groupMessages = messages.filter(msg => 
                    (msg.type === 'group' || msg.groupID) && msg.groupID === activeChat.id
                );
                console.log("Filtered group messages:", groupMessages);
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
                console.log("Filtered direct messages:", directMessages);
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
                senderID: "1", // Current user's ID
                groupID: activeChat.id,
                type: 'group',
                time: new Date().toISOString(),
                message: newMessage.trim()
            };
        } else {
            newMessageObj = {
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
        if (e.key === 'Enter') {
            handleSendMessage();
        }
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
                            filteredMessages.map((msg, index) => {
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
                                    <div key={index} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                                        <span className="messageSender">{senderName}: </span>
                                        <span className="messageText">{msg.message} </span>
                                        <span className="messageTime">
                                            {formattedDate} • {formattedTime}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-messages">
                                <p>No messages yet. Start the conversation!</p>
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