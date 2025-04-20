import React, { useState, useEffect, useRef } from 'react';
import './ProfileCardPopup.css';
import { FaUserMinus, FaRightFromBracket, FaUsers, FaUserPlus, FaGear, FaPen } from "react-icons/fa6";

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

const ProfileCardPopup = ({ chat, isOpen, onClose, onRemoveFriend, onLeaveGroup, onAddToGroup, onManageGroup, onRenameGroup }) => {
    if (!isOpen || !chat) return null;
    
    const [isRenaming, setIsRenaming] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const renameInputRef = useRef(null);
    
    useEffect(() => {
        if (isRenaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [isRenaming]);
    
    // Initialize new group name when the chat changes or modal opens
    useEffect(() => {
        if (chat) {
            setNewGroupName(chat.name || '');
        }
    }, [chat, isOpen]);
    
    const handleStartRenaming = () => {
        setIsRenaming(true);
    };
    
    const handleCancelRenaming = () => {
        setIsRenaming(false);
        setNewGroupName(chat.name || '');
    };
    
    const handleRenameSubmit = () => {
        if (newGroupName.trim() && newGroupName !== chat.name) {
            onRenameGroup(chat, newGroupName.trim());
        }
        setIsRenaming(false);
    };
    
    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            handleCancelRenaming();
        }
    };

    const handleClickOutside = (e) => {
        if (e.target.className === 'profile-card-overlay') {
            setIsRenaming(false);
            onClose();
        }
    };

    const isGroup = chat.chatType === 'group';
    
    return (
        <div className="profile-card-overlay" onClick={handleClickOutside}>
            <div className="profile-card">
                <div className="profile-card-header">
                    {chat.profileImage || chat.groupImage ? (
                        <img 
                            src={chat.profileImage || chat.groupImage} 
                            alt={chat.name} 
                            className="profile-popup-avatar" 
                        />
                    ) : (
                        <div 
                            className="profile-popup-avatar popup-initials-avatar"
                            style={{ backgroundColor: getConsistentColor(chat.name) }}
                        >
                            {getInitials(chat.name)}
                        </div>
                    )}
                    {isGroup && isRenaming ? (
                        <div className="rename-container">
                            <input
                                type="text"
                                ref={renameInputRef}
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={handleRenameKeyDown}
                                className="rename-input"
                                maxLength={30}
                            />
                            <div className="rename-actions">
                                <button onClick={handleRenameSubmit} className="rename-save">Save</button>
                                <button onClick={handleCancelRenaming} className="rename-cancel">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="name-container">
                            <h2>{chat.name}</h2>
                            {isGroup && (
                                <button onClick={handleStartRenaming} className="rename-button" title="Rename Group">
                                    <FaPen size={12} />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {!isGroup && (
                        <span className={`popup-status-indicator ${chat.isOnline ? "online" : "offline"}`}></span>
                    )}
                </div>
                
                <div className="profile-card-details">
                    {isGroup ? (
                        <>
                            <div className="detail-item">
                                <span className="detail-label">Members:</span>
                                <span className="detail-value">{chat.members?.length || 0}</span>
                            </div>
                            {chat.description && (
                                <div className="detail-item">
                                    <span className="detail-label">Description:</span>
                                    <span className="detail-value">{chat.description}</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <span className="detail-label">Created:</span>
                                <span className="detail-value">
                                    {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span className="detail-value">{chat.isOnline ? "Online" : "Offline"}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">User ID:</span>
                                <span className="detail-value">{chat.id}</span>
                            </div>
                            {chat.email && (
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{chat.email}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                <div className="profile-card-actions">
                    {isGroup ? (
                        <>
                            <button className="action-button" onClick={handleStartRenaming}>
                                <FaPen />
                                <span>Rename Group</span>
                            </button>
                            <button className="action-button" onClick={() => onAddToGroup(chat)}>
                                <FaUserPlus />
                                <span>Add Members</span>
                            </button>
                            <button className="action-button" onClick={() => onManageGroup(chat)}>
                                <FaGear />
                                <span>Manage Group</span>
                            </button>
                            <button className="action-button leave" onClick={() => onLeaveGroup(chat)}>
                                <FaRightFromBracket />
                                <span>Leave Group</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="action-button" onClick={() => onAddToGroup(chat)}>
                                <FaUsers />
                                <span>Add to Group</span>
                            </button>
                            <button className="action-button remove" onClick={() => onRemoveFriend(chat)}>
                                <FaUserMinus />
                                <span>Remove Friend</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCardPopup;