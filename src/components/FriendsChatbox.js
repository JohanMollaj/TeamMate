import React from 'react';
import { useState, useEffect, useRef } from "react";
import './friendsChatbox.css';
import { FaCirclePlus, FaPaperPlane } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

function FriendsChatbox({ activeChat }){
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // Scroll when messages update    

    useEffect(() => {
        fetch("/messages.json") // Adjust the path based on where you saved it
            .then(response => response.json())
            .then(data => setMessages(data));
    }, []);

    return (
        <>{ activeChat &&(
            <div className='chatboxContainer'>
                <div className='chatboxHeader'>
                    <h1 className='userHeader'>{activeChat.name}</h1>
                </div>
                <div className='chatboxMain'>
                    <div className="chatboxMessages">
                        {messages.map((msg, index) => {
                            const messageDate = new Date(msg.time);
                            const formattedDate = messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            const formattedTime = messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={index} className="message">
                                    <span className="messageSender">{msg.senderID}: </span>
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