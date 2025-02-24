import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane } from "react-icons/fa6";

function FriendsChatbox({ activeChat }){
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll when messages update    

    useEffect(() => {
        fetch("/messages.json") // Adjust the path based on where you saved it
            .then(response => response.json())
            .then(data => setMessages(data));
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

    return (
        <>{ activeChat &&(
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <h1 className='userHeader'>{activeChat.name}</h1>
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
                                        {formattedDate} • {formattedTime} {/* Display both date and time */}
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
                            <input type='text' className='chatboxInput' placeholder='Type a message...'/>
                        </div>
                        <button className='chatboxButton send'>
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