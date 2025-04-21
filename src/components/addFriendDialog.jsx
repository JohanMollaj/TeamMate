import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react'; // Import Loader2

// Accept initialError prop
const AddFriendDialog = ({ isOpen, onClose, onSendRequest, initialError }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [username, setUsername] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Use initialError prop passed from parent, or local state
    const [error, setError] = useState(initialError || null);

    // Reset state when dialog opens or initialError changes
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setShowConfirmation(false);
            setUsername('');
            // Update error state based on prop when dialog opens
            setError(initialError || null);
            setIsLoading(false);
        }
    }, [isOpen, initialError]); // React to changes in isOpen and initialError

     // Update error state if initialError prop changes while dialog is open
    useEffect(() => {
        if (isOpen) {
            setError(initialError || null);
        }
    }, [initialError, isOpen]);

    const handleClose = () => {
        if (isLoading) return; // Don't close while loading
        setIsAnimating(false);
        setTimeout(() => {
            onClose(); // Call parent's onClose
            // Reset state fully on close
            setUsername('');
            setShowConfirmation(false);
            setError(null);
            setIsLoading(false);
        }, 200); // Animation duration
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(null); // Clear previous errors before attempting

        try {
            await onSendRequest(username); // Call the passed function from Social.jsx

            console.log(`Friend request sent to: ${username}`);
            setShowConfirmation(true); // Show success message

            // Auto close after success confirmation is shown
            setTimeout(() => {
                handleClose();
            }, 2000); // Keep confirmation visible for 2 seconds

        } catch (err) {
            // Error occurred during onSendRequest call
            console.error('Failed to send friend request in dialog:', err);
            // Set the error state to display the message from the catch block in Social.jsx
            setError(err.message || 'Failed to send friend request. Please try again.');
            setShowConfirmation(false); // Hide confirmation on error
            setIsLoading(false); // Stop loading on error
        }
        // Do NOT set isLoading to false here if successful, wait for auto-close timer
    };


    if (!isOpen && !isAnimating) return null; // Don't render if not open or animating out

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose} // Close on backdrop click only if not loading
            />

            {/* Dialog Box */}
            <div
                className={`bg-[var(--bg-primary)] rounded-xl w-full max-w-md p-6 relative shadow-2xl transform transition-all duration-200 ease-out ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-shadow`}
                onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing if clicking inside dialog
            >

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Friend</h2>
                    <button
                        onClick={handleClose}
                        className="text-[var(--text-primary)] hover:text-white transition-colors duration-200 transform hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading} // Disable close button while loading
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error Message Area */}
                {/* Display error only if not loading and error exists */}
                {error && !isLoading && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Conditional Content: Confirmation or Form */}
                {showConfirmation ? (
                    <div className="flex flex-col items-center py-4">
                        <div className="bg-green-500/20 p-3 rounded-full mb-4">
                            <Check size={24} className="text-green-500" />
                        </div>
                        <p className="text-[var(--friend-confirmation)] text-center">
                            Success! Friend request sent to <span className='font-bold'>@{username}</span>.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            Enter a username to send a friend request. Usernames are case-sensitive!
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="transform transition-all duration-200 ease-out hover:translate-x-1">
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Username</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] text-sm">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition-all duration-200 ease-out disabled:opacity-60"
                                        placeholder="username"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 hover:scale-105 transform disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 min-w-[120px] h-[36px] flex justify-center items-center bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-all duration-200 ease-out hover:scale-105 transform hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isLoading || username.trim() === ''}
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        "Send Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddFriendDialog;