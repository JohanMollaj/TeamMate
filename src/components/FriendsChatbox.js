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

function FriendsChatbox({ activeChat }){
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll when messages update    

    useEffect(() => {
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
        }
    }, [messages, activeChat]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !activeChat) return;
        
        // Create a new message object
        const newMessageObj = {
            senderID: "1", // Current user's ID
            receiverID: activeChat.id,
            time: new Date().toISOString(),
            message: newMessage.trim()
        };

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
        <>{ activeChat &&(
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <div className='userHeader'>
                        {activeChat.profileImage ? (
                            <img src={activeChat.profileImage} alt={activeChat.name} className="friend-avatar" />
                        ) : (
                            <div 
                                className="friend-avatar initials-avatar"
                                style={{ backgroundColor: getConsistentColor(activeChat.name) }}
                            >
                                {getInitials(activeChat.name)}
                            </div>
                        )}
                        <h1>{activeChat.name}</h1>
                        <span className={`status-indicator ${activeChat.isOnline ? "online" : "offline"}`}></span>
                    </div>
                </div>
                <div className='chatboxMain'>
                    <div className="chatboxMessages">
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
                                        {formattedDate} • {formattedTime}
                                    </span>
                                </div>
                            );
                        })}
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