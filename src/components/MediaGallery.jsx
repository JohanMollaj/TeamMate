import React, { useState, useEffect } from 'react';
import './MediaGallery.css';
import { FaArrowLeft, FaArrowRight, FaDownload } from 'react-icons/fa6';
import { X } from 'lucide-react';

const MediaGallery = ({ isOpen, onClose, chat, messages }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && messages) {
            // Filter messages to find those with media attachments
            // In a real app, you would filter messages with image/video URLs
            // For this demo, we'll create mock media items
            
            const mockMediaItems = [
                { 
                    type: 'image', 
                    url: 'https://via.placeholder.com/800x600?text=Image+1', 
                    sender: 'John Doe',
                    date: new Date(Date.now() - 3600000 * 24 * 3).toLocaleDateString(), // 3 days ago
                    caption: 'Project screenshot'
                },
                { 
                    type: 'image', 
                    url: 'https://via.placeholder.com/600x800?text=Image+2', 
                    sender: 'Jane Smith',
                    date: new Date(Date.now() - 3600000 * 24 * 2).toLocaleDateString(), // 2 days ago
                    caption: 'Meeting notes'
                },
                { 
                    type: 'image', 
                    url: 'https://via.placeholder.com/1200x800?text=Image+3', 
                    sender: 'You',
                    date: new Date(Date.now() - 3600000 * 12).toLocaleDateString(), // 12 hours ago
                    caption: 'Design mockup'
                }
            ];
            
            setMediaItems(mockMediaItems);
            setLoading(false);
        }
    }, [isOpen, messages, chat]);

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
    };

    const handlePrevious = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length);
    };

    const handleThumbnailClick = (index) => {
        setActiveIndex(index);
    };

    const handleDownload = (url) => {
        // In a real app, you would implement actual download functionality
        // For this demo, we'll just open the image in a new tab
        window.open(url, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="media-gallery-overlay">
            <div className="media-gallery-container">
                <div className="media-gallery-header">
                    <h2>Media Gallery - {chat.name}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X />
                    </button>
                </div>

                {loading ? (
                    <div className="media-loading">
                        <p>Loading media...</p>
                    </div>
                ) : mediaItems.length === 0 ? (
                    <div className="no-media">
                        <p>No media found in this conversation.</p>
                    </div>
                ) : (
                    <>
                        <div className="media-viewer">
                            <button 
                                className="nav-button prev" 
                                onClick={handlePrevious}
                                disabled={mediaItems.length <= 1}
                            >
                                <FaArrowLeft />
                            </button>
                            
                            <div className="active-media">
                                <img 
                                    src={mediaItems[activeIndex].url} 
                                    alt={`Media ${activeIndex + 1}`}
                                />
                                <div className="media-info">
                                    <div className="media-metadata">
                                        <span className="sender">{mediaItems[activeIndex].sender}</span>
                                        <span className="date">{mediaItems[activeIndex].date}</span>
                                    </div>
                                    {mediaItems[activeIndex].caption && (
                                        <p className="caption">{mediaItems[activeIndex].caption}</p>
                                    )}
                                    <button 
                                        className="download-button"
                                        onClick={() => handleDownload(mediaItems[activeIndex].url)}
                                    >
                                        <FaDownload />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                className="nav-button next" 
                                onClick={handleNext}
                                disabled={mediaItems.length <= 1}
                            >
                                <FaArrowRight />
                            </button>
                        </div>

                        <div className="media-thumbnails">
                            {mediaItems.map((item, index) => (
                                <div 
                                    key={index}
                                    className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <img src={item.url} alt={`Thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MediaGallery;